// aqui a gente vai criar as rotas relacionadas aos pacientes, como cadastrar paciente, listar pacientes, editar paciente, excluir paciente, etc, a gente vai criar um arquivo pra isso, e depois importar ele no server.js pra usar as rotas
const express = require("express");
const router = express.Router();
const { cadastrarPaciente, listarPacientes, buscarPorCpf } = require("../controllers/pacientes");
const { autenticar } = require("../middlewares/auth");

router.post("/", autenticar, cadastrarPaciente); // aqui a gente tem dois argumentos antes do controller, o express executa eles em ordem, primeiro ele verifica se o usuario esta autenticado, se nao estiver ele bloqueia o acesso e devolve um erro pro frontend, se estiver autenticado ele segue pra funcao de cadastrar paciente do controller, entao so usuarios logados podem cadastrar pacientes
router.get("/", autenticar, listarPacientes); // aqui a gente tem a mesma protecao, so usuarios logados podem listar os pacientes, e dentro do controller a gente vai fazer a diferenca entre medico e admin, o medico so vai ver os pacientes dele, e o admin vai ver todos os pacientes
router.get("/cpf/:cpf", autenticar, buscarPorCpf); // aqui a gente tem uma rota pra buscar paciente por cpf, essa rota tambem precisa de autenticacao, e dentro do controller a gente vai verificar se o paciente pertence ao medico que esta fazendo a requisicao, ou se o usuario é admin, se for admin ele pode acessar qualquer paciente, se for medico ele so pode acessar os pacientes dele, entao a gente garante que um medico nao vai conseguir acessar os pacientes de outro medico usando essa rota
module.exports = router;