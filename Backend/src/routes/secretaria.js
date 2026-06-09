const express = require('express');
const router  = express.Router();
const { listarPrechecklist, direcionarParaMedico } = require('../controllers/secretaria');
const { autenticar, adminOuSecretaria } = require('../middlewares/auth');
// usamos os mideleware criados para permitir o acesso tanto para o admin quanto para a secretaria
router.get('/',        autenticar, adminOuSecretaria, listarPrechecklist);//lista todos os checklistes pendentes para serem direcionados
router.post('/direcionar', autenticar, adminOuSecretaria, direcionarParaMedico);//direciona o paciente para um medico especifico

module.exports = router;