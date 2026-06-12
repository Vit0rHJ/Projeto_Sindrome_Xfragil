const express = require("express");
const router = express.Router();
const { listarSintomas, atualizarSintoma } = require("../controllers/sintomas");
const { autenticar, apenasAdmin } = require("../middlewares/auth");

router.get("/", autenticar, listarSintomas); // o formulario do checklist usa essa lista
router.put("/:id", autenticar, apenasAdmin, atualizarSintoma); // so o admin calibra os pesos

module.exports = router;
