const express = require("express"); // cria um agrupador de rota que cuida so das rotas de autenticaco
const router = express.Router();
const { login } = require("../controllers/autenticador"); // importa a funcao de login criada antes, saimos do routes e voltamos para o scrr para encontrar o controller
// .../ é um simbolo para retorno de pastas
// POST /api/auth/login
router.post("/login", login); // vai definior quando chegfar um arequisicao do tipo post  no endereço /login, e executa a funcao do login do controller

module.exports = router;
