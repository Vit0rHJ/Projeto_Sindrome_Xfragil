//matteo ou quem estuver lendo seguinte essa parte parece mais chatinhas de entender doq é de verdae, é só le os comentario que fica d boa
//o path e o fs ja sao nativos do node, o path vai montar os caminhos de arquivos de um jeito seguro, e o file sysytem,(fs), vai criar as pastas e os arquivos no servidor
const pool = require("../config/db");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const { registrarLog } = require("../utils/auditoria");

const ENCAMINHAMENTO_LABEL = {
  observacao: "Observação / Acompanhamento de rotina",
  auxilio_clinico: "Auxílio Clínico Recomendado",
  medicacao: "Encaminhamento Prioritário (avaliação genética recomendada)",
};

const gerarLaudo = async (req, res) => {
  const { consulta_id } = req.params;

  // laudo contem score e dados clinicos, o responsavel nao pode acessar
  if (req.usuario.perfil === "responsavel") {
    return res.status(403).json({ mensagem: "Acesso restrito à equipe clínica." });
  }

  try {
    //vai buscar os dados da consulta e da checklist no banco, se ele nao encontrar algum deles vai bloquear e retornar erro pq nao existe laudo sem o checklist preenchido
    // admin e secretaria podem gerar laudo de qualquer consulta, o medico apenas das dele
    let consulta;
    if (req.usuario.perfil === "medico") {
      [consulta] = await pool.query(
        "SELECT * FROM vw_consulta_completa WHERE id = ? AND medico_id = ?",
        [consulta_id, req.usuario.id],
      );
    } else {
      [consulta] = await pool.query(
        "SELECT * FROM vw_consulta_completa WHERE id = ?",
        [consulta_id],
      );
    }

    if (consulta.length === 0) {
      return res.status(404).json({ mensagem: "Consulta não encontrada." });
    }

    const [checklist] = await pool.query(
      "SELECT * FROM vw_checklist_resumo WHERE consulta_id = ?",
      [consulta_id],
    );

    if (checklist.length === 0) {
      return res.status(404).json({
        mensagem:
          "Checklist não encontrado. Realize o checklist antes de gerar o laudo.",
      });
    }
    //vai verificar se a pasta Laudos ta salva dentro do back, se éla nao existir, vai criar sozinha na primeira vez que essa parte for rodada
    const laudosDir = path.join(__dirname, "..", "laudos");
    if (!fs.existsSync(laudosDir)) {
      fs.mkdirSync(laudosDir);
    }

    const nomeArquivo = `laudo_consulta_${consulta_id}.pdf`;
    const caminhoArquivo = path.join(laudosDir, nomeArquivo);

    //o PDFdocument vai ser nossa folha em btranco, o stream vai ser o arquivo no disco que vamo usa pra grava as parada, e o pipe vai conecta os dois, fazendo assim tudo q agente escrever no doc vai ir automaticamente para o arquivo
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(caminhoArquivo);
    doc.pipe(stream);
    //aqui é aonde vamos escrever o conteudo do pdf, da pra define fonte texto e pa
    doc.fontSize(20).text("LAUDO DE CONSULTA", { align: "center" });
    doc.fontSize(12).text("Sistema de Identificação da Síndrome do X Frágil", {
      align: "center",
    });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(14).text("DADOS DA CONSULTA");
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Médico: ${consulta[0].medico_nome}`);
    doc.text(`Paciente: ${consulta[0].paciente_nome}`);
    doc.text(`CPF: ${consulta[0].paciente_cpf}`);
    doc.text(
      `Data: ${new Date(consulta[0].data_consulta).toLocaleDateString("pt-BR")}`,
    );
    doc.text(`Status: ${consulta[0].status}`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(14).text("RESULTADO DO CHECKLIST");
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Score Total (bruto): ${checklist[0].score_total} / 12`);
    doc.text(
      `Score Ponderado por Sexo: ${Number(checklist[0].score_ponderado).toFixed(4)} (limiar: ${Number(checklist[0].limiar_usado).toFixed(2)}, sexo: ${checklist[0].paciente_sexo === "F" ? "Feminino" : "Masculino"})`,
    );
    doc.text(
      `Encaminhamento: ${ENCAMINHAMENTO_LABEL[checklist[0].encaminhamento] || checklist[0].encaminhamento.replace("_", " ").toUpperCase()}`,
    );
    doc.text(`Preenchido por: ${checklist[0].preenchido_por}`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc
      .fontSize(10)
      .text(`Documento gerado em ${new Date().toLocaleString("pt-BR")}`, {
        align: "center",
        color: "gray",
      });
    //aqui ele vai servir pra sinalizar que acabamos de escrever, depois do    fazer a parada dele vai salvar no baco e enviar para o usuario baixar
    doc.end();

    stream.on("finish", async () => {
      // vai esperarar o arquivo terminar de ser gravado no disco, é importante pra nao mandar um arquivo incompleto
      try {
        await pool.query(
          "INSERT INTO laudos (consulta_id, arquivo_pdf) VALUES (?, ?) ON DUPLICATE KEY UPDATE arquivo_pdf = ?", //se ja tiver um laudo com éssa consulta vai atualizar em vez de criar um duplicado
          [consulta_id, nomeArquivo, nomeArquivo],
        );

        await registrarLog(req.usuario, "laudo_gerado", `consulta_id=${consulta_id}`);

        res.download(caminhoArquivo, nomeArquivo); //vai enviar o arquivo pdf com o dawload direto pro navegador
      } catch (erro) {
        // o catch de fora nao alcanca erros dentro do callback do stream, entao tratamos aqui
        console.error("Erro ao registrar laudo:", erro);
        if (!res.headersSent) {
          res.status(500).json({ mensagem: "Erro interno do servidor." });
        }
      }
    });
  } catch (erro) {
    console.error("Erro ao gerar laudo:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};
//adicionei uma nova funcao, éla vai  resolver de nao mostar os dados na tela antes de imprimir so gerrar o pdf nao servia pra isso, ent agr o front vai receber os dados do JSON que ele precisa para mostrar visualmenete
const buscarDadosLaudo = async (req, res) => {
  const { consulta_id } = req.params;

  // os dados do laudo incluem score e encaminhamento, restritos a equipe clinica
  if (req.usuario.perfil === "responsavel") {
    return res.status(403).json({ mensagem: "Acesso restrito à equipe clínica." });
  }

  try {
    // mesma regra do pdf: medico ve apenas as consultas dele, admin/secretaria veem todas
    let consulta;
    if (req.usuario.perfil === "medico") {
      [consulta] = await pool.query(
        "SELECT * FROM vw_consulta_completa WHERE id = ? AND medico_id = ?",
        [consulta_id, req.usuario.id],
      );
    } else {
      [consulta] = await pool.query(
        "SELECT * FROM vw_consulta_completa WHERE id = ?",
        [consulta_id],
      );
    }

    if (consulta.length === 0) {
      return res.status(404).json({ mensagem: "Consulta não encontrada." });
    }

    const [checklist] = await pool.query(
      "SELECT * FROM checklist WHERE consulta_id = ?",
      [consulta_id],
    );

    const [paciente] = await pool.query(
      "SELECT * FROM pacientes WHERE id = ?",
      [consulta[0].paciente_id],
    );

    const [medico] = await pool.query(
      "SELECT id, nome, crm, especialidade FROM usuarios WHERE id = ?",
      [consulta[0].medico_id],
    );

    return res.status(200).json({
      consulta: consulta[0],
      checklist: checklist[0] || null,
      paciente: paciente[0] || null,
      medico: medico[0] || null,
    });
  } catch (erro) {
    console.error("Erro ao buscar dados do laudo:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { gerarLaudo, buscarDadosLaudo };
