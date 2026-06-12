const pool = require("../config/db");

// RF17 - relatório agregado para o painel administrativo:
// total de avaliações, distribuição por encaminhamento, médias por sexo
// e evolução mensal das avaliações.
const relatorioAgregado = async (req, res) => {
  try {
    const [[totais]] = await pool.query(
      `SELECT
          (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
          (SELECT COUNT(*) FROM consultas) AS total_consultas,
          (SELECT COUNT(*) FROM checklist) AS total_avaliacoes`,
    );

    const [distribuicao] = await pool.query(
      `SELECT encaminhamento, COUNT(*) AS total
       FROM checklist
       GROUP BY encaminhamento`,
    );

    const [porSexo] = await pool.query(
      `SELECT
          COALESCE(p.sexo, 'NI') AS sexo,
          COUNT(*) AS total,
          ROUND(AVG(ch.score_ponderado), 4) AS media_score_ponderado,
          ROUND(AVG(ch.score_total), 2) AS media_score_total
       FROM checklist ch
       JOIN consultas c ON c.id = ch.consulta_id
       JOIN pacientes p ON p.id = c.paciente_id
       GROUP BY p.sexo`,
    );

    const [evolucaoMensal] = await pool.query(
      `SELECT
          DATE_FORMAT(c.data_consulta, '%Y-%m') AS mes,
          COUNT(*) AS total_avaliacoes,
          ROUND(AVG(ch.score_ponderado), 4) AS media_score_ponderado
       FROM checklist ch
       JOIN consultas c ON c.id = ch.consulta_id
       GROUP BY DATE_FORMAT(c.data_consulta, '%Y-%m')
       ORDER BY mes ASC`,
    );

    const [porMedico] = await pool.query(
      `SELECT
          u.nome AS medico_nome,
          COUNT(*) AS total_avaliacoes
       FROM checklist ch
       JOIN consultas c ON c.id = ch.consulta_id
       JOIN usuarios u ON u.id = c.medico_id
       GROUP BY u.id, u.nome
       ORDER BY total_avaliacoes DESC`,
    );

    return res.status(200).json({
      totais,
      distribuicao_encaminhamento: distribuicao,
      por_sexo: porSexo,
      evolucao_mensal: evolucaoMensal,
      por_medico: porMedico,
    });
  } catch (erro) {
    console.error("Erro ao gerar relatório agregado:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

// busca as linhas da exportacao (CSV e Excel usam a mesma query);
// as datas ja saem formatadas pelo banco (dd/mm/aaaa) para nao virar
// aquele texto gigante de Date do javascript na planilha
async function buscarLinhasExportacao() {
  const [linhas] = await pool.query(
    `SELECT
        c.id AS consulta_id,
        p.nome AS paciente_nome,
        p.sexo AS paciente_sexo,
        u.nome AS medico_nome,
        DATE_FORMAT(c.data_consulta, '%d/%m/%Y') AS data_consulta,
        ch.score_total,
        ch.score_ponderado,
        ch.limiar_usado,
        ch.encaminhamento,
        ch.preenchido_por,
        DATE_FORMAT(ch.criado_em, '%d/%m/%Y %H:%i') AS criado_em
     FROM checklist ch
     JOIN consultas c ON c.id = ch.consulta_id
     JOIN pacientes p ON p.id = c.paciente_id
     JOIN usuarios u ON u.id = c.medico_id
     ORDER BY c.data_consulta DESC`,
  );
  return linhas;
}

// RF18 - exporta todas as avaliações em formato CSV
const exportarCsv = async (req, res) => {
  try {
    const linhas = await buscarLinhasExportacao();

    const colunas = [
      "consulta_id", "paciente_nome", "paciente_sexo", "medico_nome",
      "data_consulta", "score_total", "score_ponderado", "limiar_usado",
      "encaminhamento", "preenchido_por", "criado_em",
    ];

    function escaparCsv(valor) {
      if (valor === null || valor === undefined) return "";
      const texto = String(valor);
      if (/[",;\n]/.test(texto)) {
        return `"${texto.replace(/"/g, '""')}"`;
      }
      return texto;
    }

    const cabecalho = colunas.join(";");
    const corpo = linhas
      .map((linha) => colunas.map((col) => escaparCsv(linha[col])).join(";"))
      .join("\n");
    const csv = `${cabecalho}\n${corpo}`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio_avaliacoes.csv");
    return res.status(200).send("﻿" + csv); // BOM para o Excel abrir acentos corretamente
  } catch (erro) {
    console.error("Erro ao exportar CSV:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

// RF18 - exporta as avaliações em Excel (.xlsx), que abre direto na planilha
// em qualquer máquina, sem depender da associação de arquivos .csv do sistema
const exportarExcel = async (req, res) => {
  try {
    const XLSX = require("xlsx");
    const linhas = await buscarLinhasExportacao();

    const ENC_LABEL = {
      observacao: "Observação",
      auxilio_clinico: "Auxílio Clínico",
      medicacao: "Encaminhamento Prioritário",
    };

    // monta as linhas com cabeçalhos amigáveis para a planilha
    const dados = linhas.map((l) => ({
      "Consulta": l.consulta_id,
      "Paciente": l.paciente_nome,
      "Sexo": l.paciente_sexo === "M" ? "Masculino" : l.paciente_sexo === "F" ? "Feminino" : "—",
      "Médico": l.medico_nome,
      "Data da Consulta": l.data_consulta,
      "Score Total": l.score_total,
      "Score Ponderado": Number(l.score_ponderado),
      "Limiar": Number(l.limiar_usado),
      "Encaminhamento": ENC_LABEL[l.encaminhamento] || l.encaminhamento,
      "Preenchido Por": l.preenchido_por === "medico" ? "Médico" : "Responsável",
      "Registrado Em": l.criado_em,
    }));

    const planilha = XLSX.utils.json_to_sheet(dados);
    // larguras das colunas para nao abrir tudo espremido
    planilha["!cols"] = [
      { wch: 9 }, { wch: 24 }, { wch: 10 }, { wch: 22 }, { wch: 15 },
      { wch: 11 }, { wch: 15 }, { wch: 8 }, { wch: 26 }, { wch: 14 }, { wch: 17 },
    ];

    const pasta = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(pasta, planilha, "Avaliações");
    const buffer = XLSX.write(pasta, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=relatorio_avaliacoes.xlsx");
    return res.status(200).send(buffer);
  } catch (erro) {
    console.error("Erro ao exportar Excel:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

// histórico de avaliações de um paciente, usado para o gráfico de evolução do score
const historicoPaciente = async (req, res) => {
  const { paciente_id } = req.params;

  try {
    const [historico] = await pool.query(
      `SELECT
          c.id AS consulta_id,
          c.data_consulta,
          ch.score_total,
          ch.score_ponderado,
          ch.limiar_usado,
          ch.encaminhamento
       FROM checklist ch
       JOIN consultas c ON c.id = ch.consulta_id
       WHERE c.paciente_id = ?
       ORDER BY c.data_consulta ASC`,
      [paciente_id],
    );

    return res.status(200).json(historico);
  } catch (erro) {
    console.error("Erro ao buscar histórico do paciente:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

// RNF08 - consulta da trilha de auditoria (LGPD)
const listarAuditoria = async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT id, usuario_id, usuario_nome, perfil, acao, detalhes, criado_em
       FROM logs_auditoria
       ORDER BY criado_em DESC
       LIMIT 200`,
    );

    return res.status(200).json(logs);
  } catch (erro) {
    console.error("Erro ao listar auditoria:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { relatorioAgregado, exportarCsv, exportarExcel, historicoPaciente, listarAuditoria };
