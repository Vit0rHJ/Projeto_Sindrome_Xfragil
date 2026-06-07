//matteo ou quem estuver lendo seguinte essa parte parece mais chatinhas de entender doq é de verdae, é só le os comentario que fica d boa
//o path e o fs ja sao nativos do node, o path vai montar os caminhos de arquivos de um jeito seguro, e o file sysytem,(fs), vai criar as pastas e os arquivos no servidor
const pool = require("../config/db");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const gerarLaudo = async (req, res) => {
  const { consulta_id } = req.params;

  try {
    //vai buscar os dados da consulta e da checklist no banco, se ele nao encontrar algum deles vai bloquear e retornar erro pq nao existe laudo sem o checklist preenchido
    const [consulta] = await pool.query(
      "SELECT * FROM vw_consulta_completa WHERE id = ? AND medico_id = ?",
      [consulta_id, req.usuario.id],
    );

    if (consulta.length === 0) {
      return res.status(404).json({ mensagem: "Consulta não encontrada." });
    }

    const [checklist] = await pool.query(
      "SELECT * FROM vw_checklist_resumo WHERE consulta_id = ?",
      [consulta_id],
    );

    if (checklist.length === 0) {
      return res
        .status(404)
        .json({
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
    doc
      .fontSize(12)
      .text("Sistema de Identificação da Síndrome do X Frágil", {
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
    doc.fontSize(12).text(`Score Total: ${checklist[0].score_total} / 12`);
    doc.text(
      `Encaminhamento: ${checklist[0].encaminhamento.replace("_", " ").toUpperCase()}`,
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
      await pool.query(
        "INSERT INTO laudos (consulta_id, arquivo_pdf) VALUES (?, ?) ON DUPLICATE KEY UPDATE arquivo_pdf = ?", //se ja tiver um laudo com éssa consulta vai atualizar em vez de criar um duplicado
        [consulta_id, nomeArquivo, nomeArquivo],
      );

      res.download(caminhoArquivo, nomeArquivo); //vai enviar o arquivo pdf com o dawload direto pro navegador
    });
  } catch (erro) {
    console.error("Erro ao gerar laudo:", erro);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { gerarLaudo };
