// aqui a gente vai criar as rotas relacionadas aos pacientes, como cadastrar paciente, listar pacientes, editar paciente, excluir paciente, etc, a gente vai criar um arquivo pra isso, e depois importar ele no server.js pra usar as rotas
const express = require("express");
const router = express.Router();
const { cadastrarPaciente, listarPacientes } = require("../controllers/pacientes");
const { autenticar } = require("../middlewares/auth");

router.post("/", autenticar, cadastrarPaciente); // aqui a gente tem dois argumentos antes do controller, o express executa eles em ordem, primeiro ele verifica se o usuario esta autenticado, se nao estiver ele bloqueia o acesso e devolve um erro pro frontend, se estiver autenticado ele segue pra funcao de cadastrar paciente do controller, entao so usuarios logados podem cadastrar pacientes
router.get("/", autenticar, listarPacientes); // aqui a gente tem a mesma protecao, so usuarios logados podem listar os pacientes, e dentro do controller a gente vai fazer a diferenca entre medico e admin, o medico so vai ver os pacientes dele, e o admin vai ver todos os pacientes

module.exports = router;