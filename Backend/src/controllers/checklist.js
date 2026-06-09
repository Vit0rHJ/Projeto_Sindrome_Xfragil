const pool = require("../config/db");

const salvarChecklist = async (req, res) => {
  const {
    consulta_id,
    preenchido_por,
    observacoes,
    sin_atraso_fala,
    sin_dif_aprendizado,
    sin_deficit_atencao,
    sin_def_intelectual,
    sin_hiperatividade,
    sin_agressividade,
    sin_evita_contato_visual,
    sin_evita_contato_fisico,
    sin_movimentos_repetitivos,
    sin_frouxidao,
    sin_macroquidia,
    sin_face_alongada,
  } = req.body;

  if (!consulta_id) {
    return res.status(400).json({ mensagem: "ID da consulta é obrigatório." });
  }

  try {
    // aqui a gente vai verificar se a consulta existe e se o usuário tem permissão para acessar ela, porque só o médico responsável ou o responsável pelo paciente podem preencher o checklist, entao a gente precisa verificar isso antes de permitir que eles preencham
    let consulta; // estamos usando o let aqui porque a variavel consulta vai ser atribuida dentro do if, se fosse const daria erro porque a const precisa ser atribuida no momento da declaracao, e como a gente tem essa condicao de verificacao diferente pra medico e responsavel, a gente nao consegue atribuir a consulta no momento da declaracao, entao a gente declara ela como let sem valor, e depois dentro do if a gente atribui o valor dela com o resultado da query correta dependendo do perfil do usuario

    if (req.usuario.perfil === "responsavel") {
      [consulta] = await pool.query(
        `SELECT c.id FROM consultas c 
         JOIN pacientes p ON p.id = c.paciente_id 
         WHERE c.id = ? AND p.responsavel_id = ?`,
        [consulta_id, req.usuario.id],
      );
    } else {
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
    // aqui é a verificaco de duplicidade ou seja cada consulta so vai ter uma check list, se tentar cadastrar duas, vai retornar 401 e dar erro
    const [existente] = await pool.query(
      "SELECT id FROM checklist WHERE consulta_id = ?",
      [consulta_id],
    );

    if (existente.length > 0) {
      return res
        .status(409)
        .json({ mensagem: "Checklist já cadastrado para essa consulta." });
    }

    await pool.query(
      `INSERT INTO checklist (
                consulta_id, preenchido_por, observacoes,
                sin_atraso_fala, sin_dif_aprendizado, sin_deficit_atencao,
                sin_def_intelectual, sin_hiperatividade, sin_agressividade,
                sin_evita_contato_visual, sin_evita_contato_fisico,
                sin_movimentos_repetitivos, sin_frouxidao,
                sin_macroquidia, sin_face_alongada
            ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        consulta_id,
        preenchido_por || "medico",
        observacoes || null,
        sin_atraso_fala || 0,
        sin_dif_aprendizado || 0,
        sin_deficit_atencao || 0,
        sin_def_intelectual || 0,
        sin_hiperatividade || 0,
        sin_agressividade || 0,
        sin_evita_contato_visual || 0,
        sin_evita_contato_fisico || 0,
        sin_movimentos_repetitivos || 0,
        sin_frouxidao || 0,
        sin_macroquidia || 0,
        sin_face_alongada || 0,
      ],
    );
    // score e encaminhamento automatico
    const [resultado] = await pool.query(
      "SELECT score_total, encaminhamento FROM checklist WHERE consulta_id = ?",
      [consulta_id],
    );

    return res.status(201).json({
      mensagem: "Checklist salvo com sucesso.",
      consulta_id: Number(consulta_id),
      score_total: resultado[0].score_total,
      encaminhamento: resultado[0].encaminhamento,
    });
  } catch (erro) {
    console.error("Erro ao salvar checklist:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const buscarChecklist = async (req, res) => {
  const { consulta_id } = req.params;

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
