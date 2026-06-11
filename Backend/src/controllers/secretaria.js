const pool = require("../config/db");

const listarPrechecklist = async (req, res) => {
  //busca todos os checklists preenchidos por responsaveis, a secretaria vai utilizar isso para ver quais pacientes precisam ser direcionados para um medico
  try {
    const [checklists] = await pool.query(
      `SELECT
                ch.id,
                ch.consulta_id,
                ch.score_total,
                ch.preenchido_por,
                ch.criado_em,
                p.nome AS paciente_nome,
                p.cpf AS paciente_cpf,
                p.cidade,
                p.estado,
                c.status,
                CASE WHEN u.perfil = 'medico' THEN c.medico_id ELSE NULL END AS medico_id
            FROM checklist ch
            JOIN consultas c ON c.id = ch.consulta_id
            JOIN pacientes p ON p.id = c.paciente_id
            JOIN usuarios u ON u.id = c.medico_id
            WHERE ch.preenchido_por = 'responsavel'
            ORDER BY ch.criado_em DESC`,
      // o CASE é necessario porque quando o responsavel cria a consulta, o medico_id
      // guarda temporariamente o id do proprio responsavel ate a secretaria direcionar;
      // sem isso o front mostraria todo mundo como "Direcionado" e o botao nunca apareceria
      //WHERE ch.preenchido_por = 'responsavel', serve para para filtrar apenas pre checklists, nao aqueles feitos pelos medicos
    );

    return res.status(200).json(checklists);
  } catch (erro) {
    console.error("Erro ao listar pré-checklists:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const direcionarParaMedico = async (req, res) => {
  // vai atualizar o medico_id tanto na consilt aquanto no paciente, ent o medico que for escolhido vai conseguir ver esse paciente na home dele
  const { consulta_id, medico_id } = req.body;

  if (!consulta_id || !medico_id) {
    return res
      .status(400)
      .json({ mensagem: "ID da consulta e do médico são obrigatórios." });
  }

  try {
    const [medico] = await pool.query(
      'SELECT id FROM usuarios WHERE id = ? AND perfil = "medico" AND ativo = 1',
      [medico_id],
    );

    if (medico.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "Médico não encontrado ou inativo." });
    }

    const [consulta] = await pool.query(
      "SELECT id FROM consultas WHERE id = ?",
      [consulta_id],
    );

    if (consulta.length === 0) {
      return res.status(404).json({ mensagem: "Consulta não encontrada." });
    }

    await pool.query(
      'UPDATE consultas SET medico_id = ?, status = "pendente" WHERE id = ?', //serve para garantir que a consulta fique pendente para o medico atender
      [medico_id, consulta_id],
    );

    await pool.query(
      "UPDATE pacientes SET medico_id = ? WHERE id = (SELECT paciente_id FROM consultas WHERE id = ?)",
      [medico_id, consulta_id],
    );

    return res
      .status(200)
      .json({ mensagem: "Paciente direcionado ao médico com sucesso." });
  } catch (erro) {
    console.error("Erro ao direcionar paciente:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { listarPrechecklist, direcionarParaMedico };
