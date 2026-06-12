// Senhor eu de amanha nao se esquece de comentar isso aqui
//  porque se nao vc talvez esqueca doq vc tava fazendo

const pool = require("../config/db");

const criarConsulta = async (req, res) => {
  const { paciente_id, data_consulta, observacoes } = req.body;

  if (!paciente_id || !data_consulta) {
    return res
      .status(400)
      .json({ mensagem: "Paciente e data da consulta são obrigatórios." });
  }

  try {
    // admin e secretaria podem abrir consulta (reavaliacao) para qualquer
    // paciente: nesse caso a consulta fica com o medico atual do paciente.
    // medico/responsavel continuam restritos aos proprios pacientes.
    let paciente;
    let medicoDaConsulta = req.usuario.id;

    if (req.usuario.perfil === "admin" || req.usuario.perfil === "secretaria") {
      [paciente] = await pool.query(
        "SELECT id, medico_id FROM pacientes WHERE id = ?",
        [paciente_id],
      );
      if (paciente.length > 0 && paciente[0].medico_id) {
        medicoDaConsulta = paciente[0].medico_id;
      }
    } else {
      [paciente] = await pool.query(
        "SELECT id FROM pacientes WHERE id = ? AND medico_id = ?",
        [paciente_id, req.usuario.id],
      );
    }

    if (paciente.length === 0) {
      return res
        .status(403)
        .json({ mensagem: "Paciente não encontrado ou não pertence a você." });
    }

    const [resultado] = await pool.query(
      "INSERT INTO consultas (paciente_id, medico_id, data_consulta, observacoes) VALUES (?, ?, ?, ?)",
      [paciente_id, medicoDaConsulta, data_consulta, observacoes],
    );

    return res.status(201).json({
      mensagem: "Consulta criada com sucesso.",
      consulta_id: resultado.insertId, // depois dagente fazer um insert, ele vai retorna o id do registro que acabou de ser criado, dai ele devolve esse id pro frontend, pra que o frontend possa usar esse id pra acessar os detalhes da consulta depois, ou pra atualizar o status dela etc
    });
  } catch (erro) {
    console.error("Erro ao criar consulta:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const listarConsultas = async (req, res) => {
  try {
    let consultas;

    if (req.usuario.perfil === "admin" || req.usuario.perfil === "secretaria") {
      [consultas] = await pool.query("SELECT * FROM vw_consulta_completa");//vamo faze uma viw para nao ter que fazer um joi garnde no codigo, a view ja entrega os dados do paciente e do medico junto com a consulta, entao fica mais facil de trabalhar com isso no back e no front, a view é tipo uma tabela virtual que a gente cria no banco de dados, ela nao armazena os dados, ela so faz uma consulta e entrega o resultado como se fosse uma tabela, entao a gente pode criar uma view que junta os dados das consultas, dos pacientes e dos medicos, dai quando a gente fizer uma consulta nessa view, ela ja vai entregar tudo juntoar as consultas, dai quando for um admin ele lista todas as consultas, e quando for um medico ele lista so as consultas dele, usando o id do medico que ta no token pra filtrar as consultas na view
    } else {
      [consultas] = await pool.query(
        "SELECT * FROM vw_consulta_completa WHERE medico_id = ?",
        [req.usuario.id],
      );
    }

    // o encaminhamento vem da view para alimentar os contadores da home,
    // mas o responsavel nao pode ver esse dado, entao removemos para ele
    if (req.usuario.perfil === "responsavel") {
      consultas = consultas.map(({ encaminhamento, ...resto }) => resto);
    }

    return res.status(200).json(consultas);
  } catch (erro) {
    console.error("Erro ao listar consultas:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const atualizarStatus = async (req, res) => {
  const { id } = req.params; // aqui vai ser um pouco diferente dos outros reqs pq ele vai pegar valores diretos direto da URL, por exemplo /api/consultas/5, 5 vai ser o id
  const { status } = req.body;

  const statusValidos = ["pendente", "realizada", "cancelada"];
  if (!statusValidos.includes(status)) { //ele vai verificar se o status enviado é um dos tre spermitidos antes de mandar para o banco
    return res.status(400).json({ mensagem: "Status inválido." });
  }

  try {
    if (req.usuario.perfil === "admin") {
      // o admin pode atualizar o status de qualquer consulta
      await pool.query("UPDATE consultas SET status = ? WHERE id = ?", [
        status,
        id,
      ]);
    } else {
      await pool.query(
        "UPDATE consultas SET status = ? WHERE id = ? AND medico_id = ?",
        [status, id, req.usuario.id],
      );
    }

    return res.status(200).json({ mensagem: "Status atualizado com sucesso." });
  } catch (erro) {
    console.error("Erro ao atualizar status:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { criarConsulta, listarConsultas, atualizarStatus };
