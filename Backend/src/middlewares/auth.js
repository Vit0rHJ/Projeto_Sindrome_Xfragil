const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
    //pega o token do cabeçalho da requisição
    const authHeader = req.headers['authorization']; // quando o react fazer uma requisicao  para uma rota protegida, ele manda a token assim no cabecalho
    //Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    const token = authHeader && authHeader.split(' ')[1];// so vai pegar a parte depois de Bearer

    //se não veio token, bloqueia
    if (!token) {
        return res.status(401).json({ mensagem: 'Acesso negado. Token não informado.' });
    }

    //verifica se o token é válido
    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = dados; //depois da verificaco dos tokens, salvamos os dados do usuario dentro da requisicao, assim qualquer controller que rodar depois ja tem acessoo a req.usuario.id e outras reqs, sem precisar acessar o banco
        next(); // se o token for valido, a gente chama o next pra continuar o fluxo da requisição, e a gente adiciona os dados do usuario no req.usuario pra que as próximas funções possam acessar esses dados e saber quem é o usuário que tá fazendo a requisição
    } catch (erro) {
        return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    }
};
//esse middleware  vai ser utilizado somente para o admin acessar, ele roda depois do autenticador pq primeiro vamos verificar se esta logado e depois se é admin
const apenasAdmin = (req, res, next) => {
    if (req.usuario.perfil !== 'admin') {
        return res.status(403).json({ mensagem: 'Acesso restrito a administradores.' });
    }
    next();
};

module.exports = { autenticar, apenasAdmin };
// as rotas devem ficar +- assim
//rota do admin router.post('/rota', autenticar, apenasAdmin, controller);
//e rota de qualquer usuario router.get('/rota', autenticar, controller);
