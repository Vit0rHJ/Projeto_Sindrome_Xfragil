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

module.exports = { listarSintomas, atualizarSintoma };
