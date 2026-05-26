const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
    // 1. Pega o token do cabeçalho da requisição
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Se não veio token, bloqueia
    if (!token) {
        return res.status(401).json({ mensagem: 'Acesso negado. Token não informado.' });
    }

    // 3. Verifica se o token é válido
    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = dados;
        next();
    } catch (erro) {
        return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    }
};

const apenasAdmin = (req, res, next) => {
    if (req.usuario.perfil !== 'admin') {
        return res.status(403).json({ mensagem: 'Acesso restrito a administradores.' });
    }
    next();
};

module.exports = { autenticar, apenasAdmin };