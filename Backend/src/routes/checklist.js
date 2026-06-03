// 
const express = require('express');
const router  = express.Router();
const { salvarChecklist, buscarChecklist } = require('../controllers/checklist');
const { autenticar } = require('../middlewares/auth');

router.post('/',           autenticar, salvarChecklist);
router.get('/:consulta_id', autenticar, buscarChecklist);//vamo usar o consulta_id como parametro dinamico na URL, pra quando o front chamar GET/api/checklist/1 o 1 vai para o req.params_id no coontroller

module.exports = router;