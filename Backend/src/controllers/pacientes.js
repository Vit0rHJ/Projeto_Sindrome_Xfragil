const pool = require("../config/db");
const fs = require('fs');
const path = require('path');
const cadastrarPaciente = async (req, res) => {
    const { 
        nome, cpf, data_nascimento, sexo, nome_mae, nome_pai,
        email, telefone, whatsapp, telefone2, cidade, estado, pais,
        nome_responsavel, cpf_responsavel, telefone_responsavel, grau_parentesco,
        ja_fez_exame_dna, interesse_exame_pcr, resultado_exame,
        diagnostico_autismo, tem_irmaos, historico_familiar_di,
        historico_menopausa, historico_ataxia
    } = req.body;

    if (!nome || !cpf || !nome_responsavel || !cpf_responsavel || !telefone_responsavel) {
        return res.status(400).json({ mensagem: 'Nome, CPF e dados do responsável são obrigatórios.' });
    }

    try {
        const [existe] = await pool.query(
            'SELECT id FROM pacientes WHERE cpf = ?', // antes de cadastrar o paciente, a gente verifica se ja existe um paciente com esse cpf, pra evitar cadastros duplicados, a gente faz uma query no banco buscando por pacientes que tenham o mesmo cpf, se encontrar algum resultado é pq ja existe um paciente com esse cpf, entao a gente bloqueia o cadastro e devolve um erro pro frontend, se nao encontrar nenhum resultado é pq o cpf ainda nao ta cadastrado, entao a gente pode seguir com o cadastro normalmente
            [cpf]
        );

        if (existe.length > 0) {
            return res.status(409).json({ mensagem: 'CPF já cadastrado.' });
        }

      // se quem cadastra é um responsavel, guardamos o vinculo dele em responsavel_id,
      // assim ele continua vendo o paciente mesmo depois da secretaria direcionar
      // a consulta para um medico (que troca o medico_id)
      const responsavelId = req.usuario.perfil === 'responsavel' ? req.usuario.id : null;

      const [resultado] = await pool.query(
            `INSERT INTO pacientes (
                nome, cpf, data_nascimento, sexo, nome_mae, nome_pai,
                email, telefone, whatsapp, telefone2, cidade, estado, pais,
                nome_responsavel, cpf_responsavel, telefone_responsavel, grau_parentesco,
                ja_fez_exame_dna, interesse_exame_pcr, resultado_exame,
                diagnostico_autismo, tem_irmaos, historico_familiar_di,
                historico_menopausa, historico_ataxia, medico_id, responsavel_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                // o ||0  é para campos opcionais, se eles nao forem enviados, o padra deles sempre vai ser 0
                // o || null é uma parada parecida mas é no caso de um enum opcional, se ele  nao for enviaado ele fica null
                nome, cpf, data_nascimento, sexo, nome_mae, nome_pai,
                email, telefone, whatsapp, telefone2, cidade, estado, pais || 'Brasil', // se o usuario nao preenche esse campo ele voi usar brasil como padrao
                nome_responsavel, cpf_responsavel, telefone_responsavel, grau_parentesco,
                ja_fez_exame_dna || 0, interesse_exame_pcr || 0, resultado_exame || null,
                diagnostico_autismo || 0, tem_irmaos || 0, historico_familiar_di || 'nao',
                historico_menopausa || 'nao', historico_ataxia || 'nao', req.usuario.id, responsavelId
            ]
        );

        return res.status(201).json({ mensagem: 'Paciente cadastrado com sucesso.', 
            id: resultado.insertId });
    } catch (erro) {
        console.error('Erro ao cadastrar paciente:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const listarPacientes = async (req, res) => {
    try {
        let pacientes;

        if (req.usuario.perfil === 'admin' || req.usuario.perfil === 'secretaria') { // vai verificar se o perfil esta dentro do token, se for o token de admin ou secretaria vai buscar todos os pacientes, se for o token do medico vai filtrar so os dele
            [pacientes] = await pool.query(
                'SELECT id, nome, cpf, email, telefone, data_nascimento, cidade, estado FROM pacientes'
            );
        } else if (req.usuario.perfil === 'responsavel') {
            // o responsavel ve os pacientes que ele mesmo cadastrou, mesmo depois
            // que a secretaria direcionar para um medico (o medico_id muda, o responsavel_id nao)
            [pacientes] = await pool.query(
                'SELECT id, nome, cpf, email, telefone, data_nascimento, cidade, estado FROM pacientes WHERE responsavel_id = ? OR medico_id = ?',
                [req.usuario.id, req.usuario.id]
            );
        } else {
            [pacientes] = await pool.query(
                'SELECT id, nome, cpf, email, telefone, data_nascimento, cidade, estado FROM pacientes WHERE medico_id = ?',
                [req.usuario.id] // quando um medico cadastrar um pacienete, o id do medico vai ser salvo junto com os dados do paciente, entao quando o medico for listar os pacientes, a gente faz uma query buscando so os pacientes que tem o id do medico igual ao id do medico logado, assim cada medico so ve os pacientes dele, e nao os pacientes dos outros medicos, basicamente automaticamente  vinculamos o paciente  ao medico logado sem necessidade dele informar o proprio id
            );
        }

        return res.status(200).json(pacientes);

    } catch (erro) {
        console.error('Erro ao listar pacientes:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const buscarPorCpf = async (req, res) => {
    const { cpf } = req.params; //vai pegar o cpf direto da url, o cpf vai vir pelo req params e nao pelo body pq é uma busca e ano um envio de dados

    try {
        const [paciente] = await pool.query(
            'SELECT id, nome, cpf, email, telefone, data_nascimento, cidade, estado FROM pacientes WHERE cpf = ?',// vai buscar o paciente pelo cpf
            [cpf]
        );

        if (paciente.length === 0) {
            return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
        }

        return res.status(200).json(paciente[0]);

    } catch (erro) {
        console.error('Erro ao buscar paciente:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};
const atualizarFotoPaciente = async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ mensagem: 'Nenhuma foto enviada.' });
    }

    try {
        const [paciente] = await pool.query(
            'SELECT foto FROM pacientes WHERE id = ?',
            [id]
        );

        if (paciente.length === 0) {
            return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
        }

        if (paciente[0].foto) {
            const caminhoAntigo = path.join(__dirname, '..', 'uploads', paciente[0].foto);
            if (fs.existsSync(caminhoAntigo)) {
                fs.unlinkSync(caminhoAntigo);
            }
        }

        await pool.query(
            'UPDATE pacientes SET foto = ? WHERE id = ?',
            [req.file.filename, id]
        );

        return res.status(200).json({
            mensagem: 'Foto atualizada com sucesso.',
            foto: req.file.filename
        });

    } catch (erro) {
        console.error('Erro ao atualizar foto do paciente:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};
module.exports = { cadastrarPaciente, listarPacientes, buscarPorCpf,atualizarFotoPaciente };