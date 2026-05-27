const express = require("express");
const router = express.Router();
const { cadastrarMedico, listarMedicos } = require("../controllers/usuarios"); // vao impoetar as duas  funcoes que montamos no controller
const { autenticar, apenasAdmin } = require("../middlewares/auth"); //  vai importar os middlewares de autenticar e apenasAdmin pra proteger as rotas, so o admin pode cadastrar medico e listar os medicos, entao as duas rotas vao ter os dois middlewares, primeiro a gente verifica se ta logado e depois se é admin

router.post("/", autenticar, apenasAdmin, cadastrarMedico); //aqui temos tre argumentos  antes do controller, o express executa eles em ordem, verifica se esta logado, depois se é dmin, so depois de tudo isso vai cadastar o medico, se qualquer um falhar a cadeia para na hora que falhar
router.get("/", autenticar, apenasAdmin, listarMedicos); // usa a mesma base de protecao para listar os medicos, so o admin pode ver a lista de medicos cadastrados no sistema, entao a gente usa os mesmos middlewares de autenticar e apenasAdmin pra proteger essa rota

module.exports = router;
