const express = require('express');
const router  = express.Router();
const { criarConsulta, listarConsultas, atualizarStatus } = require('../controllers/consultas');
const { autenticar } = require('../middlewares/auth');

router.post('/',        autenticar, criarConsulta);
router.get('/',         autenticar, listarConsultas);
router.patch('/:id',    autenticar, atualizarStatus);//aqui quando o front chamar PATCH/api/consultas/5 o 5 vai ir para o rq.params.id no controller vamo usa o patch no lugar do put pq vamos atualizar so o status

module.exports = router;