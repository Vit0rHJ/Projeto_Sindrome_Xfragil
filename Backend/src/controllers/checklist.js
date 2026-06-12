const pool = require("../config/db");
const { registrarLog } = require("../utils/auditoria");

// Limiares clínicos do score ponderado, conforme Requisitos_Sistema.pdf (RF11/RF12/RNF16)
const LIMIAR_MASCULINO = 0.56;
const LIMIAR_FEMININO = 0.55;

// calcula o score ponderado (0-1) a partir das respostas do checklist e dos
// pesos cadastrados em sintomas_pesos, usando o peso de acordo com o sexo
// do paciente. Também devolve o limiar clínico (RNF16) e o encaminhamento
// sugerido com base na comparação entre o score e o limiar.
function calcularScorePonderado(respostas, pesos, sexo) {
  const colunaPeso = sexo === "F" ? "peso_feminino" : "peso_masculino";
  const limiar = sexo === "F" ? LIMIAR_FEMININO : LIMIAR_MASCULINO;

  let score = 0;
  for (const peso of pesos) {
    const valor = Number(respostas[peso.codigo]) || 0;
    score += valor * Number(peso[colunaPeso]);
  }
  score = Math.round(score * 10000) / 10000;

  let encaminhamento;
  if (score >= limiar) {
    encaminhamento = "medicacao";
  } else if (score >= limiar * 0.7) {
    encaminhamento = "auxilio_clinico";
  } else {
    encaminhamento = "observacao";
  }

  return { score_ponderado: score, limiar_usado: limiar, encaminhamento };
}

const salvarChecklist = async (req, res) => {
  // o preenchido_por nao vem mais do body: o servidor deriva do perfil do
  // token, entao ninguem consegue se passar por medico na requisicao.
  // as respostas dos sintomas sao lidas dinamicamente a partir da tabela
  // sintomas_pesos (o admin pode adicionar sintomas novos sem mexer aqui)
  const { consulta_id, observacoes } = req.body;

  if (!consulta_id) {
    return res.status(400).json({ mensagem: "ID da consulta é obrigatório." });
  }

  try {
    // aqui a gente vai verificar se a consulta existe e se o usuário tem permissão para acessar ela, porque só o médico responsável ou o responsável pelo paciente podem preencher o checklist, entao a gente precisa verificar isso antes de permitir que eles preencham
    let consulta; // estamos usando o let aqui porque a variavel consulta vai ser atribuida dentro do if, se fosse const daria erro porque a const precisa ser atribuida no momento da declaracao, e como a gente tem essa condicao de verificacao diferente pra cada perfil, a gente nao consegue atribuir a consulta no momento da declaracao, entao a gente declara ela como let sem valor, e depois dentro do if a gente atribui o valor dela com o resultado da query correta dependendo do perfil do usuario

    if (req.usuario.perfil === "admin") {
      // o admin pode preencher o checklist de qualquer consulta, entao basta ela existir
      [consulta] = await pool.query("SELECT id FROM consultas WHERE id = ?", [
        consulta_id,
      ]);
    } else {
      // medico só preenche consultas dele; quando o responsavel cria a consulta,
      // o medico_id fica com o id dele ate a secretaria atribuir um medico,
      // entao a mesma verificacao serve para os dois perfis
      [consulta] = await pool.query(
        "SELECT id FROM consultas WHERE id = ? AND medico_id = ?",
        [consulta_id, req.usuario.id],
      );
    }

    if (consulta.length === 0) {
      return res
        .status(403)
        .json({ mensagem: "Consulta não encontrada ou sem permissão." });
    }
    // regra do fluxo clinico:
    // - o pré-checklist do responsavel serve apenas de triagem para a secretaria
    // - a avaliacao oficial é a do medico, que SUBSTITUI o pré-checklist
    // - ninguem refaz a propria avaliacao (responsavel 1x, medico 1x)
    const quemPreenche =
      req.usuario.perfil === "responsavel" ? "responsavel" : "medico";

    const [existente] = await pool.query(
      "SELECT id, preenchido_por FROM checklist WHERE consulta_id = ?",
      [consulta_id],
    );

    let substituiPre = false;
    if (existente.length > 0) {
      if (existente[0].preenchido_por === "medico") {
        return res.status(409).json({
          mensagem: "Avaliação clínica já realizada para essa consulta.",
        });
      }
      if (quemPreenche === "responsavel") {
        return res.status(409).json({
          mensagem: "Pré-checklist já enviado para essa consulta.",
        });
      }
      // existe um pré-checklist do responsavel e quem preenche agora é o medico:
      // a avaliacao clinica oficial substitui a triagem
      substituiPre = true;
    }

    // busca o sexo do paciente (define qual coluna de pesos e qual limiar usar - RF11/RF12/RNF16)
    const [pacienteRows] = await pool.query(
      `SELECT p.sexo FROM consultas c
       JOIN pacientes p ON p.id = c.paciente_id
       WHERE c.id = ?`,
      [consulta_id],
    );
    const sexo = pacienteRows[0]?.sexo || null;

    // busca TODOS os sintomas registrados (ativos pontuam; inativos sao
    // gravados como 0 para manter as colunas consistentes) - RNF16
    const [pesosTodos] = await pool.query(
      "SELECT codigo, peso_masculino, peso_feminino, ativo FROM sintomas_pesos",
    );

    // os codigos viram nomes de coluna no SQL, entao filtramos por seguranca
    // (eles ja nascem validados no cadastro de sintomas, isso é so garantia)
    const sintomasValidos = pesosTodos.filter((p) =>
      /^sin_[a-z0-9_]{2,45}$/.test(p.codigo),
    );
    const ativos = sintomasValidos.filter((p) => p.ativo);

    // monta as respostas dinamicamente: 1 se o sintoma ativo foi marcado
    const respostas = {};
    for (const p of ativos) {
      respostas[p.codigo] = req.body[p.codigo] ? 1 : 0;
    }

    const { score_ponderado, limiar_usado, encaminhamento } = calcularScorePonderado(
      respostas,
      ativos,
      sexo,
    );

    const codigos = sintomasValidos.map((p) => p.codigo);
    const colunasSql = codigos.map((c) => `\`${c}\``).join(", ");
    const valoresSintomas = codigos.map((c) => respostas[c] ?? 0);

    if (substituiPre) {
      // o medico assume a avaliacao: sobrescreve as respostas do pré-checklist
      // (a trigger BEFORE UPDATE recalcula o score_total automaticamente)
      const setSql = codigos.map((c) => `\`${c}\` = ?`).join(", ");
      await pool.query(
        `UPDATE checklist SET
                preenchido_por = 'medico', observacoes = ?, ${setSql},
                score_ponderado = ?, limiar_usado = ?, encaminhamento = ?
            WHERE consulta_id = ?`,
        [
          observacoes || null,
          ...valoresSintomas,
          score_ponderado,
          limiar_usado,
          encaminhamento,
          consulta_id,
        ],
      );
    } else {
      const placeholders = codigos.map(() => "?").join(", ");
      await pool.query(
        `INSERT INTO checklist (
                consulta_id, preenchido_por, observacoes, ${colunasSql},
                score_ponderado, limiar_usado, encaminhamento
            ) VALUES (?, ?, ?, ${placeholders}, ?, ?, ?)`,
        [
          consulta_id,
          quemPreenche,
          observacoes || null,
          ...valoresSintomas,
          score_ponderado,
          limiar_usado,
          encaminhamento,
        ],
      );
    }
    // score_total é calculado pela trigger do banco (soma simples 0-12)
    const [resultado] = await pool.query(
      "SELECT score_total, score_ponderado, limiar_usado, encaminhamento FROM checklist WHERE consulta_id = ?",
      [consulta_id],
    );

    await registrarLog(
      req.usuario,
      substituiPre ? "checklist_medico_substituiu_pre" : "checklist_salvo",
      `consulta_id=${consulta_id}, score_ponderado=${score_ponderado}, encaminhamento=${encaminhamento}`,
    );

    // o responsavel nao pode ver score nem encaminhamento (regra do requisito),
    // entao para ele devolvemos apenas a confirmacao de envio
    if (req.usuario.perfil === "responsavel") {
      return res.status(201).json({
        mensagem: "Checklist enviado com sucesso.",
        consulta_id: Number(consulta_id),
      });
    }

    return res.status(201).json({
      mensagem: substituiPre
        ? "Avaliação clínica registrada (substituiu o pré-checklist de triagem)."
        : "Checklist salvo com sucesso.",
      consulta_id: Number(consulta_id),
      score_total: resultado[0].score_total,
      score_ponderado: resultado[0].score_ponderado,
      limiar_usado: resultado[0].limiar_usado,
      encaminhamento: resultado[0].encaminhamento,
    });
  } catch (erro) {
    console.error("Erro ao salvar checklist:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const buscarChecklist = async (req, res) => {
  const { consulta_id } = req.params;

  // o resumo do checklist contem score e encaminhamento, que o responsavel nao pode ver
  if (req.usuario.perfil === "responsavel") {
    return res.status(403).json({ mensagem: "Acesso restrito à equipe clínica." });
  }

  try {
    const [checklist] = await pool.query(
      "SELECT * FROM vw_checklist_resumo WHERE consulta_id = ?",
      [consulta_id],
    );

    if (checklist.length === 0) {
      return res.status(404).json({ mensagem: "Checklist não encontrado." });
    }

    return res.status(200).json(checklist[0]);
  } catch (erro) {
    console.error("Erro ao buscar checklist:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { salvarChecklist, buscarChecklist };
