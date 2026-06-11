const express = require("express");
const router = express.Router();
const {
  relatorioAgregado,
  exportarCsv,
  historicoPaciente,
  listarAuditoria,
} = require("../controllers/relatorios");
const { autenticar, adminOuSecretaria, apenasAdmin } = require("../middlewares/auth");

router.get("/agregado", autenticar, adminOuSecretaria, relatorioAgregado);
router.get("/csv", autenticar, adminOuSecretaria, exportarCsv);
router.get("/historico/:paciente_id", autenticar, historicoPaciente);
router.get("/auditoria", autenticar, apenasAdmin, listarAuditoria);

module.exports = router;
