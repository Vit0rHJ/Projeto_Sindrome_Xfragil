// montar o routes do laudos, a rota dele ja to no server
const express = require("express");
const router = express.Router();
const { gerarLaudo, buscarDadosLaudo } = require("../controllers/laudos");
const { autenticar } = require("../middlewares/auth");

router.get("/:consulta_id", autenticar, gerarLaudo); // aqui vamos usar o get pq tamo buscando e baixando um arquivo, o consulta_id vem direto da url
router.get("/:consulta_id/pdf", autenticar, buscarDadosLaudo); // essa rota é para o front buscar os dados da consulta, do paciente e do medico pra mostrar na tela antes de gerar o pdf, o front vai chamar essa rota quando o usuario clicar pra ver os detalhes da consulta, dai ele mostra os dados na tela e tem um botao pra gerar o pdf, quando o usuario clicar nesse botao ele chama a rota de gerar laudo que ja gera o pdf e baixa direto
module.exports = router;
