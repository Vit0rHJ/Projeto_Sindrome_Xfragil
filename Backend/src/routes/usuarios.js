const express = require("express");
const router = express.Router();
const {
  cadastrarMedico,
  listarMedicos,
  editarMedico,
  deletarMedico,
} = require("../controllers/usuarios"); // vao impoetar as duas  funcoes que montamos no controller
const { autenticar, apenasAdmin } = require("../middlewares/auth"); //  vai importar os middlewares de autenticar e apenasAdmin pra proteger as rotas, so o admin pode cadastrar medico e listar os medicos, entao as duas rotas vao ter os dois middlewares, primeiro a gente verifica se ta logado e depois se é admin

router.post("/", autenticar, apenasAdmin, cadastrarMedico); //aqui temos tre argumentos  antes do controller, o express executa eles em ordem, verifica se esta logado, depois se é dmin, so depois de tudo isso vai cadastar o medico, se qualquer um falhar a cadeia para na hora que falhar
router.get("/", autenticar, apenasAdmin, listarMedicos); // usa a mesma base de protecao para listar os medicos, so o admin pode ver a lista de medicos cadastrados no sistema, entao a gente usa os mesmos middlewares de autenticar e apenasAdmin pra proteger essa rota
router.put("/:id", autenticar, apenasAdmin, editarMedico); // aqui a gente tem uma rota de edicao de medico, o admin pode editar os dados do medico, entao a gente protege essa rota com os mesmos middlewares de autenticar e apenasAdmin, e a gente passa o id do medico que quer editar na url, entao a gente consegue identificar qual medico o admin quer editar
router.delete("/:id", autenticar, apenasAdmin, deletarMedico); // aqui a gente tem uma rota pra deletar medico, o admin pode remover um medico do sistema, entao a gente protege essa rota com os mesmos middlewares de autenticar e apenasAdmin, e a gente passa o id do medico que quer deletar na url, entao a gente consegue identificar qual medico o admin quer remover
module.exports = router;
