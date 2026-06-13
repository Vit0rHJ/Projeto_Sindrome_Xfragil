const pool = require("../config/db");
const fs = require('fs');
const path = require('path');

// formatos exigidos pelo sistema (RNF de qualidade de dados):
// cpf no padrao 000.000.000-00 e celular brasileiro +55 (DD) 9XXXX-XXXX
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const CELULAR_REGEX = /^\+55 \(\d{2}\) 9\d{4}-\d{4}$/;

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

    // validacao de formato no servidor (o front tem mascara, mas a API nao
    // pode confiar no cliente)
    if (!CPF_REGEX.test(cpf)) {
        return res.status(400).json({ mensagem: 'CPF do paciente deve estar no formato 000.000.000-00.' });
    }
    if (!CPF_REGEX.test(cpf_responsavel)) {
        return res.status(400).json({ mensagem: 'CPF do responsável deve estar no formato 000.000.000-00.' });
    }
    if (!CELULAR_REGEX.test(telefone_responsavel)) {
        return res.status(400).json({ mensagem: 'Telefone do responsável deve ser um celular no formato +55 (DD) 9XXXX-XXXX.' });
    }
    // telefones opcionais: se vierem preenchidos, tambem precisam estar no padrao
    for (const [campo, valor] of [['telefone', telefone], ['whatsapp', whatsapp], ['telefone2', telefone2]]) {
        if (valor && !CELULAR_REGEX.test(valor)) {
            return res.status(400).json({ mensagem: `O campo ${campo} deve ser um celular no formato +55 (DD) 9XXXX-XXXX.` });
        }
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
                'SELECT id, nome, cpf, email, telefone, data_nascimento, cidade, estado, foto FROM pacientes'
            );
        } else if (req.usuario.perfil === 'responsavel') {
            // o responsavel ve os pacientes que ele mesmo cadastrou, mesmo depois
            // que a secretaria direcionar para um medico (o medico_id muda, o responsavel_id nao)
            [pacientes] = await pool.query(
                'SELECT id, nome, cpf, email, telefone, data_nascimento, cidade, estado, foto FROM pacientes WHERE responsavel_id = ? OR medico_id = ?',
                [req.usuario.id, req.usuario.id]
            );
        } else {
            [pacientes] = await pool.query(
                'SELECT id, nome, cpf, email, telefone, data_nascimento, cidade, estado, foto FROM pacientes WHERE medico_id = ?',
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
            'SELECT id, nome, cpf, email, telefone, data_nascimento, cidade, estado, foto FROM pacientes WHERE cpf = ?',// vai buscar o paciente pelo cpf
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
// busca um paciente completo por id (usado para preencher o formulario de
// edicao). respeita a mesma regra de acesso da edicao.
const buscarPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [paciente] = await pool.query(
            'SELECT * FROM pacientes WHERE id = ?',
            [id]
        );

        if (paciente.length === 0) {
            return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
        }

        const p = paciente[0];
        const perfil = req.usuario.perfil;
        const ehDono =
            perfil === 'admin' ||
            perfil === 'secretaria' ||
            p.medico_id === req.usuario.id ||
            p.responsavel_id === req.usuario.id;

        if (!ehDono) {
            return res.status(403).json({ mensagem: 'Você não tem permissão para acessar este paciente.' });
        }

        return res.status(200).json(p);
    } catch (erro) {
        console.error('Erro ao buscar paciente:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

// RF08 - edita os dados cadastrais de um paciente. O CPF do paciente nao é
// editavel por ser a identidade do registro; os demais campos podem ser
// atualizados. Mesma regra de acesso da foto (admin/secretaria qualquer um,
// medico/responsavel apenas os seus).
const editarPaciente = async (req, res) => {
    const { id } = req.params;
    const {
        nome, data_nascimento, sexo, nome_mae, nome_pai,
        email, telefone, whatsapp, telefone2, cidade, estado, pais,
        nome_responsavel, cpf_responsavel, telefone_responsavel, grau_parentesco
    } = req.body;

    if (!nome || !nome_responsavel || !cpf_responsavel || !telefone_responsavel) {
        return res.status(400).json({ mensagem: 'Nome e dados do responsável são obrigatórios.' });
    }
    if (!CPF_REGEX.test(cpf_responsavel)) {
        return res.status(400).json({ mensagem: 'CPF do responsável deve estar no formato 000.000.000-00.' });
    }
    if (!CELULAR_REGEX.test(telefone_responsavel)) {
        return res.status(400).json({ mensagem: 'Telefone do responsável deve ser um celular no formato +55 (DD) 9XXXX-XXXX.' });
    }
    for (const [campo, valor] of [['telefone', telefone], ['whatsapp', whatsapp], ['telefone2', telefone2]]) {
        if (valor && !CELULAR_REGEX.test(valor)) {
            return res.status(400).json({ mensagem: `O campo ${campo} deve ser um celular no formato +55 (DD) 9XXXX-XXXX.` });
        }
    }

    try {
        const [paciente] = await pool.query(
            'SELECT medico_id, responsavel_id FROM pacientes WHERE id = ?',
            [id]
        );

        if (paciente.length === 0) {
            return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
        }

        const perfil = req.usuario.perfil;
        const ehDono =
            perfil === 'admin' ||
            perfil === 'secretaria' ||
            paciente[0].medico_id === req.usuario.id ||
            paciente[0].responsavel_id === req.usuario.id;

        if (!ehDono) {
            return res.status(403).json({ mensagem: 'Você não tem permissão para editar este paciente.' });
        }

        await pool.query(
            `UPDATE pacientes SET
                nome = ?, data_nascimento = ?, sexo = ?, nome_mae = ?, nome_pai = ?,
                email = ?, telefone = ?, whatsapp = ?, telefone2 = ?, cidade = ?, estado = ?, pais = ?,
                nome_responsavel = ?, cpf_responsavel = ?, telefone_responsavel = ?, grau_parentesco = ?
             WHERE id = ?`,
            [
                nome, data_nascimento || null, sexo || null, nome_mae || null, nome_pai || null,
                email || null, telefone || null, whatsapp || null, telefone2 || null,
                cidade || null, estado || null, pais || 'Brasil',
                nome_responsavel, cpf_responsavel, telefone_responsavel, grau_parentesco || null,
                id
            ]
        );

        return res.status(200).json({ mensagem: 'Paciente atualizado com sucesso.' });
    } catch (erro) {
        console.error('Erro ao editar paciente:', erro);
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
            'SELECT foto, medico_id, responsavel_id FROM pacientes WHERE id = ?',
            [id]
        );

        if (paciente.length === 0) {
            return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
        }

        // controle de acesso: admin e secretaria podem alterar a foto de qualquer
        // paciente; o medico apenas dos seus; o responsavel apenas dos que cadastrou.
        // sem isso, qualquer usuario logado conseguiria trocar a foto de qualquer paciente
        const perfil = req.usuario.perfil;
        const ehDono =
            perfil === 'admin' ||
            perfil === 'secretaria' ||
            paciente[0].medico_id === req.usuario.id ||
            paciente[0].responsavel_id === req.usuario.id;

        if (!ehDono) {
            return res.status(403).json({ mensagem: 'Você não tem permissão para alterar a foto deste paciente.' });
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
module.exports = { cadastrarPaciente, listarPacientes, buscarPorCpf, buscarPorId, editarPaciente, atualizarFotoPaciente };