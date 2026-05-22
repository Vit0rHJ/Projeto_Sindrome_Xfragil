const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

// ---------------------------------------------------------------
// LOGIN
// Recebe email e senha, verifica no banco e devolve um token
// ---------------------------------------------------------------
const login = async (req, res) => {
    const { email, senha } = req.body;

    // 1. Verifica se os campos foram enviados
    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    try {
        // 2. Busca o usuário no banco pelo email
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        // 3. Se não encontrou nenhum usuário com esse email
        if (rows.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const usuario = rows[0];

        // 4. Compara a senha digitada com o hash salvo no banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        // 5. Gera o token JWT com os dados do usuário
        const token = jwt.sign(
            {
                id:     usuario.id,
                nome:   usuario.nome,
                perfil: usuario.perfil
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 6. Devolve o token e os dados básicos do usuário
        return res.status(200).json({
            token,
            usuario: {
                id:     usuario.id,
                nome:   usuario.nome,
                email:  usuario.email,
                perfil: usuario.perfil
            }
        });

    } catch (erro) {
        console.error('Erro no login:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = { login };