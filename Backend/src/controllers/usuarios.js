const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const upload = require('../utils/upload');
const fs = require('fs');
const path = require('path');

const cadastrarMedico = async (req, res) => {
  const { nome, email, senha, crm, especialidade } = req.body; // aqui vai peegar os dados que vieram da requisicao, a formatacao ta asssim pq tamo usando um negocio chamado desconstrucao que pega varias propriedades de um objeto de uma vez

  if (!nome || !email || !senha || !crm || !especialidade) {
    // verifica se os campos obrigatorios foram enviados
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios." });
  }
  try {
    const [existente] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email], // antes dele realizar o cadastro vai verificar se ja existe alguem com esse gmail, podemos fazer éssa verificacao atraves so do id mesmo
    );
    if (existente.length > 0) {
      // se encontra ao menos um resultado é pq o email ja esta em uso
      return res.status(409).json({ mensagem: "Email já cadastrado." });
    }
    const senha_hash = await bcrypt.hash(senha, 10); // gera o hash da senha, o numero 10 é a quantidade de rounds de processamento do hash, quanto maior mais seguro, mas tambem mais demorado pra gerar, 10 é um valor comum e equilibrado pra isso

    await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil, crm, especialidade) VALUES (?, ?, ?, "medico", ?, ?)', // insere o novo medico no banco de dados, o perfil do usuario vai ser sempre medico, por isso ta fixo no query, o id é auto increment entao nao precisa passar ele aqui, e a senha a gente passa o hash dela, pra nao salvar a senha em texto no banco de dados
      [nome, email, senha_hash, crm, especialidade],
    );
    return res.status(201).json({ mensagem: "Médico cadastrado com sucesso." });
  } catch (erro) {
    console.error("Erro no cadastro do médico:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const listarMedicos = async (req, res) => {
  // busca todos os usuarios com perfil medico, e devolve os dados basicos deles, sem a senha claro, pra que o admin possa ver a lista de medicos cadastrados no sistema, essa rota pode ser acessada por qualquer usuario logado, nao precisa ser admin, entao nao precisa do middleware de apenasAdmin, mas precisa do middleware de autenticar pra verificar se ta logado
  try {
    const [medicos] = await pool.query(
      'SELECT id, nome, email, crm, especialidade, criado_em FROM usuarios WHERE perfil = "medico" AND ativo = 1',
    );

    return res.status(200).json(medicos);
  } catch (erro) {
    console.error("Erro ao listar médicos:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};
// aqui vai ser a rota de edicao de medicos pelo admin
const editarMedico = async (req, res) => {
  const { id } = req.params;
  const { nome, crm, especialidade } = req.body; //vai pegar os campos que o admin quer atualizar, agente na vai permitir alterer o email ou a senha poraqui por seguranca

  try {
    await pool.query(
      'UPDATE usuarios SET nome = ?, crm = ?, especialidade = ? WHERE id = ? AND perfil = "medico"',
      [nome, crm, especialidade, id],
    );

    return res.status(200).json({ mensagem: "Médico atualizado com sucesso." });
  } catch (erro) {
    console.error("Erro ao editar médico:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};
//para desativar medicos, eu decidi que seria melhor apenas deixar medicos como inativos em vez de apagalos completamente do sistema para preservar o historico
//tambem estou implementado a reatribuicao dos pacinetes dos medicos, antes da desativacao deles 
const desativarMedico = async (req, res) => {
  const { id } = req.params; // vai pegar o id do medico que vem da url
const { novo_medico_id } = req.body;

    if (!novo_medico_id) {
        return res.status(400).json({ mensagem: 'Informe o médico que vai assumir os pacientes.' });
    }

    try {
        const [medico] = await pool.query(
            'SELECT id FROM usuarios WHERE id = ? AND perfil = "medico"',
            [id]
        );

        if (medico.length === 0) {
            return res.status(404).json({ mensagem: 'Médico não encontrado.' });
        }

        const [novoMedico] = await pool.query(
            'SELECT id FROM usuarios WHERE id = ? AND perfil = "medico" AND ativo = 1',
            [novo_medico_id] // o admin precisa informar no body qual medico vai assumir os pacientes
        );

        if (novoMedico.length === 0) {
            return res.status(404).json({ mensagem: 'Novo médico não encontrado ou inativo.' });
        }
// o UPDATE pacientes transfere os pacinetes para o novo medico
        await pool.query(
            'UPDATE pacientes SET medico_id = ? WHERE medico_id = ?',//
            [novo_medico_id, id]
        );
//O UPDATE consultasvai transferir tambem todas as consultas pendentes
        await pool.query(
            'UPDATE consultas SET medico_id = ? WHERE medico_id = ?',
            [novo_medico_id, id]
        );
// o UPDATE usuarios SET ativo = 0, so vai desativar depois de transfirir tudo
        await pool.query(
            'UPDATE usuarios SET ativo = 0 WHERE id = ?',
            [id]
        );

        return res.status(200).json({ mensagem: 'Médico desativado e pacientes transferidos com sucesso.' });

    } catch (erro) {
        console.error('Erro ao desativar médico:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};


const cadastrarSecretaria = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: "Nome, email e senha são obrigatórios." });
  }

  try {
    const [existente] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
    );

    if (existente.length > 0) {
      return res.status(409).json({ mensagem: "Email já cadastrado." });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, "secretaria")',
      [nome, email, senha_hash],
    );

    return res.status(201).json({ mensagem: "Secretaria cadastrada com sucesso." });
  } catch (erro) {
    console.error("Erro no cadastro da secretaria:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const atualizarFotoMedico = async (req, res) => {
    const { id } = req.params;

    if (!req.file) { // o req.file é onde o multer vai colocar os arquivos apos ele processar eles, se estiver vazio é pq  nenhum arquivo foi enviado
        return res.status(400).json({ mensagem: 'Nenhuma foto enviada.' });
    }

    try {
        const [medico] = await pool.query(
            'SELECT foto FROM usuarios WHERE id = ? AND perfil = "medico"',
            [id]
        );

        if (medico.length === 0) {
            return res.status(404).json({ mensagem: 'Médico não encontrado.' });
        }

        if (medico[0].foto) {
            const caminhoAntigo = path.join(__dirname, '..', 'uploads', medico[0].foto);
            if (fs.existsSync(caminhoAntigo)) {
                fs.unlinkSync(caminhoAntigo);// o unlyncsync serve parea deletar o arquivo do disco
            }
        }

        await pool.query(
            'UPDATE usuarios SET foto = ? WHERE id = ?',
            [req.file.filename, id] // é o nome gerado pelo multer que salvamos no banco
        );

        return res.status(200).json({
            mensagem: 'Foto atualizada com sucesso.',
            foto: req.file.filename
        });

    } catch (erro) {
        console.error('Erro ao atualizar foto:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};
module.exports = {
  cadastrarMedico,
  listarMedicos,
  editarMedico,
  desativarMedico,
  atualizarFotoMedico,
  cadastrarSecretaria,
};
