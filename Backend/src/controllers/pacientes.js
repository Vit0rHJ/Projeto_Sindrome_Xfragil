const pool = require("../config/db");

const cadastrarPaciente = async (req, res) => {
    const { nome, cpf, email, telefone, data_nascimento, nome_responsavel, cpf_responsavel, telefone_responsavel } = req.body;

    if (!nome || !cpf || !email || !telefone || !data_nascimento) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const [existe] = await pool.query(
            'SELECT id FROM pacientes WHERE cpf = ?', // antes de cadastrar o paciente, a gente verifica se ja existe um paciente com esse cpf, pra evitar cadastros duplicados, a gente faz uma query no banco buscando por pacientes que tenham o mesmo cpf, se encontrar algum resultado é pq ja existe um paciente com esse cpf, entao a gente bloqueia o cadastro e devolve um erro pro frontend, se nao encontrar nenhum resultado é pq o cpf ainda nao ta cadastrado, entao a gente pode seguir com o cadastro normalmente,
            [cpf]
        );
        if (existe.length > 0) {
            return res.status(409).json({ mensagem: 'CPF já cadastrado.' });
        }

        await pool.query(
            'INSERT INTO pacientes (nome, cpf, email, telefone, data_nascimento, nome_responsavel, cpf_responsavel, telefone_responsavel, medico_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, cpf, email, telefone, data_nascimento, nome_responsavel, cpf_responsavel, telefone_responsavel, req.usuario.id]
        );

        return res.status(201).json({ mensagem: 'Paciente cadastrado com sucesso.' });

    } catch (erro) {
        console.error('Erro ao cadastrar paciente:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};
const listarPacientes = async (req, res) => {
    try {
        let pacientes;

        if (req.usuario.perfil === 'admin') { // vai verificar se o perfil esta dentro do token, se for o token de admin vai buscar todos os pacientes, se for o token do medico vai filtrar so os dele
            [pacientes] = await pool.query(
                'SELECT id, nome, cpf, email, telefone, data_nascimento FROM pacientes'
            );
        } else {
            [pacientes] = await pool.query(
                'SELECT id, nome, cpf, email, telefone, data_nascimento FROM pacientes WHERE medico_id = ?',
                [req.usuario.id] // quando um medico cadastrar um pacienete, o id do medico vai ser salvo junto com os dados do paciente, entao quando o medico for listar os pacientes, a gente faz uma query buscando so os pacientes que tem o id do medico igual ao id do medico logado, assim cada medico so ve os pacientes dele, e nao os pacientes dos outros medicos, basicamente automaticamente  vinculamos o paciente  ao medico logado sem necessidade dele informar o proprio id
            );
        }

        return res.status(200).json(pacientes);

    } catch (erro) {
        console.error('Erro ao listar pacientes:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = { cadastrarPaciente, listarPacientes };
