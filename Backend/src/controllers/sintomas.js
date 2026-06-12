const pool = require("../config/db");
const { registrarLog } = require("../utils/auditoria");

// lista os sintomas do checklist com seus pesos por sexo (tabela sintomas_pesos).
// o formulario do checklist usa essa lista para se montar dinamicamente, entao
// um sintoma desativado pelo admin some do formulario sem mexer em codigo (RNF16)
const listarSintomas = async (req, res) => {
  try {
    // o admin ve todos (inclusive desativados, para poder reativar);
    // os demais perfis recebem apenas os ativos, que é o que o formulario usa
    const filtro = req.usuario.perfil === "admin" ? "" : "WHERE ativo = 1";
    const [sintomas] = await pool.query(
      `SELECT id, codigo, nome, categoria, peso_masculino, peso_feminino, ativo
       FROM sintomas_pesos ${filtro} ORDER BY categoria, id`,
    );

    return res.status(200).json(sintomas);
  } catch (erro) {
    console.error("Erro ao listar sintomas:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

// admin edita a gravidade (pesos por sexo) e o status de um sintoma.
// os pesos sao a "calibragem" do score ponderado: mudar aqui muda o calculo
// de todas as proximas avaliacoes, sem alterar nenhuma linha de codigo
const atualizarSintoma = async (req, res) => {
  const { id } = req.params;
  const { peso_masculino, peso_feminino, ativo } = req.body;

  const pesoM = Number(peso_masculino);
  const pesoF = Number(peso_feminino);

  if (Number.isNaN(pesoM) || Number.isNaN(pesoF) || pesoM < 0 || pesoF < 0 || pesoM > 1 || pesoF > 1) {
    return res.status(400).json({ mensagem: "Os pesos devem ser números entre 0 e 1." });
  }

  try {
    const [existe] = await pool.query("SELECT id, nome FROM sintomas_pesos WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ mensagem: "Sintoma não encontrado." });
    }

    await pool.query(
      "UPDATE sintomas_pesos SET peso_masculino = ?, peso_feminino = ?, ativo = ? WHERE id = ?",
      [pesoM, pesoF, ativo ? 1 : 0, id],
    );

    await registrarLog(
      req.usuario,
      "sintoma_atualizado",
      `${existe[0].nome}: peso_m=${pesoM}, peso_f=${pesoF}, ativo=${ativo ? 1 : 0}`,
    );

    return res.status(200).json({ mensagem: "Sintoma atualizado com sucesso." });
  } catch (erro) {
    console.error("Erro ao atualizar sintoma:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

// gera o codigo da coluna a partir do nome (ex: "Orelhas proeminentes"
// vira "sin_orelhas_proeminentes"). só letras minusculas, numeros e _,
// porque esse codigo vira nome de coluna na tabela checklist
function gerarCodigo(nome) {
  const slug = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return `sin_${slug}`;
}

// recria os triggers de score_total somando TODAS as colunas de sintomas
// registradas em sintomas_pesos (necessario sempre que um sintoma é criado)
async function regenerarTriggers() {
  const [linhas] = await pool.query("SELECT codigo FROM sintomas_pesos ORDER BY id");
  const codigos = linhas
    .map((l) => l.codigo)
    .filter((c) => /^sin_[a-z0-9_]{2,45}$/.test(c));
  const soma = codigos.map((c) => `NEW.\`${c}\``).join(" + ");

  await pool.query("DROP TRIGGER IF EXISTS trg_calcular_score_insert");
  await pool.query(
    `CREATE TRIGGER trg_calcular_score_insert BEFORE INSERT ON checklist
     FOR EACH ROW SET NEW.score_total = (${soma})`,
  );
  await pool.query("DROP TRIGGER IF EXISTS trg_calcular_score_update");
  await pool.query(
    `CREATE TRIGGER trg_calcular_score_update BEFORE UPDATE ON checklist
     FOR EACH ROW SET NEW.score_total = (${soma})`,
  );
}

// admin adiciona um sintoma novo ao checklist: cria a coluna na tabela
// checklist, registra os pesos em sintomas_pesos e regenera os triggers.
// o formulario, o calculo do score e o pdf do laudo se adaptam sozinhos.
const criarSintoma = async (req, res) => {
  const { nome, categoria, peso_masculino, peso_feminino } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ mensagem: "Nome do sintoma é obrigatório." });
  }
  if (!["cognitivo_comportamental", "fisico"].includes(categoria)) {
    return res.status(400).json({ mensagem: "Categoria inválida." });
  }

  const pesoM = Number(peso_masculino);
  const pesoF = Number(peso_feminino);
  if (Number.isNaN(pesoM) || Number.isNaN(pesoF) || pesoM < 0 || pesoF < 0 || pesoM > 1 || pesoF > 1) {
    return res.status(400).json({ mensagem: "Os pesos devem ser números entre 0 e 1." });
  }

  const codigo = gerarCodigo(nome.trim());
  // o codigo vira nome de coluna, entao a validacao aqui é rigorosa
  if (!/^sin_[a-z0-9_]{2,45}$/.test(codigo)) {
    return res.status(400).json({ mensagem: "Nome do sintoma inválido para gerar o código." });
  }

  try {
    const [existe] = await pool.query(
      "SELECT id FROM sintomas_pesos WHERE codigo = ?",
      [codigo],
    );
    if (existe.length > 0) {
      return res.status(409).json({ mensagem: "Já existe um sintoma com esse nome." });
    }

    // 1) cria a coluna na tabela checklist (o codigo ja foi validado acima)
    await pool.query(
      `ALTER TABLE checklist ADD COLUMN \`${codigo}\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT ${pool.escape(nome.trim())}`,
    );

    // 2) registra o sintoma com os pesos
    await pool.query(
      "INSERT INTO sintomas_pesos (codigo, nome, categoria, peso_masculino, peso_feminino) VALUES (?, ?, ?, ?, ?)",
      [codigo, nome.trim(), categoria, pesoM, pesoF],
    );

    // 3) triggers passam a somar a nova coluna no score_total
    await regenerarTriggers();

    await registrarLog(
      req.usuario,
      "sintoma_criado",
      `${nome.trim()} (${codigo}): peso_m=${pesoM}, peso_f=${pesoF}, categoria=${categoria}`,
    );

    return res.status(201).json({ mensagem: "Sintoma adicionado ao checklist com sucesso.", codigo });
  } catch (erro) {
    console.error("Erro ao criar sintoma:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { listarSintomas, atualizarSintoma, criarSintoma };
