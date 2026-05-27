const bcrypt = require('bcryptjs');// o bcscrypt é uma biblioteca para hash de senhas, isso é importante pra segurança do sistema, assim a gente não guarda as senhas explicitas no banco de dados, e mesmo que alguém consiga acesse o banco de dados, as senhas estarao protegidas
const jwt    = require('jsonwebtoken');  // o jwt é uma biblioteca para criar e verificar tokens de autenticação// o bcscrypt é uma biblioteca para hash de senhas, isso é importante pra segurança do sistema, assim a gente não guarda as senhas explicitas no banco de dados, e mesmo que alguém consiga acesse o banco de dados, as senhas estarao protegidas
const pool   = require('../config/db');// importa a pool de conexões com o banco pra fazer as queries e verificar se o usuario existe e se a senha ta certa


//status http 
// 400 é pra dados faltando
//401 nao autorizado
//500 erro no servidor
//200 sucesso
// a função de login vai receber o email e a senha do usuario, verificar se o usuario existe no banco de dados, e se a senha ta correta, se tudo estiver certo, ela vai criar um token de autenticação e enviar pro frontend, pra que o frontend possa usar esse token nas próximas requisições pra acessar as rotas protegidas do sistema
const login = async (req, res) => {
    const { email, senha } = req.body; // aqui vao ficam os dados que o react enviou, o email e a senha, que a gente vai usar pra verificar se o usuario existe e se a senha ta certa

    // verifica se os campos foram enviados
    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    try {
        //busca o usuário no banco pelo email
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email] // executa um querry no banco usando o ? de placeholder para evitar sql injection
        );

        //se não encontrou nenhum usuário com esse email
        if (rows.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const usuario = rows[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash); //compara a senha digitada com o hash salvo, no banco a senha nao é salva como texto éla é salva em hash, isso faz a comparacao correta

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        // gera o token JWT com os dados do usuário, pra quando ele chegar na proxima requisicao vamos saber se é admin ou medico, sem precisar acessar o banco
        const token = jwt.sign( 
            {
                id:     usuario.id,
                nome:   usuario.nome,
                perfil: usuario.perfil
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // devolve o token e os dados básicos do usuário
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

