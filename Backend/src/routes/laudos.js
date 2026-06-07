// montar o routes do laudos, a rota dele ja to no server
const express = require('express');
const router  = express.Router();
const { gerarLaudo } = require('../controllers/laudos');
const { autenticar } = require('../middlewares/auth');

router.get('/:consulta_id', autenticar, gerarLaudo); // aqui vamos usar o get pq tamo buscando e baixando um arquivo, o consulta_id vem direto da url

module.exports = router;