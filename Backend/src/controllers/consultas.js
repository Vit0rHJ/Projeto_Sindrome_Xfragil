


// Senhor eu de amanha nao se esquece de comentar isso aqui
//  porque se nao vc talvez esqueca doq vc tava fazendo

const pool = require('../config/db');

const criarConsulta = async (req, res) => {
    const { paciente_id, data_consulta, observacoes } = req.body;

    if (!paciente_id || !data_consulta) {
        return res.status(400).json({ mensagem: 'Paciente e data da consulta são obrigatórios.' });
    }

    try {
        const [paciente] = await pool.query(
            'SELECT id FROM pacientes WHERE id = ? AND medico_id = ?',
            [paciente_id, req.usuario.id]
        );

        if (paciente.length === 0) {
            return res.status(403).json({ mensagem: 'Paciente não encontrado ou não pertence a você.' });
        }

        const [resultado] = await pool.query(
            'INSERT INTO consultas (paciente_id, medico_id, data_consulta, observacoes) VALUES (?, ?, ?, ?)',
            [paciente_id, req.usuario.id, data_consulta, observacoes]
        );

        return res.status(201).json({ 
            mensagem: 'Consulta criada com sucesso.',
            consulta_id: resultado.insertId
        });

    } catch (erro) {
        console.error('Erro ao criar consulta:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const listarConsultas = async (req, res) => {
    try {
        let consultas;

        if (req.usuario.perfil === 'admin') {
            [consultas] = await pool.query('SELECT * FROM vw_consulta_completa');
        } else {
            [consultas] = await pool.query(
                'SELECT * FROM vw_consulta_completa WHERE medico_id = ?',
                [req.usuario.id]
            );
        }

        return res.status(200).json(consultas);

    } catch (erro) {
        console.error('Erro ao listar consultas:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const atualizarStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['pendente', 'realizada', 'cancelada'];
    if (!statusValidos.includes(status)) {
        return res.status(400).json({ mensagem: 'Status inválido.' });
    }

    try {
        await pool.query(
            'UPDATE consultas SET status = ? WHERE id = ? AND medico_id = ?',
            [status, id, req.usuario.id]
        );

        return res.status(200).json({ mensagem: 'Status atualizado com sucesso.' });

    } catch (erro) {
        console.error('Erro ao atualizar status:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = { criarConsulta, listarConsultas, atualizarStatus };