const pool = require("../config/db");

// Registra uma ação na trilha de auditoria (RNF08 / LGPD).
// Nunca lança erro para não quebrar o fluxo principal da requisição.
async function registrarLog(usuario, acao, detalhes) {
  try {
    await pool.query(
      "INSERT INTO logs_auditoria (usuario_id, usuario_nome, perfil, acao, detalhes) VALUES (?, ?, ?, ?, ?)",
      [usuario?.id || null, usuario?.nome || null, usuario?.perfil || null, acao, detalhes || null],
    );
  } catch (erro) {
    console.error("Erro ao registrar log de auditoria:", erro.message);
  }
}

module.exports = { registrarLog };
