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

// a lista de sintomas do pdf vem da tabela sintomas_pesos (o admin pode
// adicionar sintomas novos, entao nada aqui pode ser fixo)

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

    // busca o checklist completo (as 12 respostas) junto com os dados do
    // paciente e do medico que o pdf precisa exibir
    const [checklist] = await pool.query(
      `SELECT ch.*, p.sexo AS paciente_sexo, p.nome_responsavel,
              u.crm, u.especialidade
       FROM checklist ch
       JOIN consultas c ON c.id = ch.consulta_id
       JOIN pacientes p ON p.id = c.paciente_id
       JOIN usuarios u ON u.id = c.medico_id
       WHERE ch.consulta_id = ?`,
      [consulta_id],
    );

    if (checklist.length === 0) {
      return res.status(404).json({
        mensagem:
          "Checklist não encontrado. Realize o checklist antes de gerar o laudo.",
      });
    }

    // lista dinamica de sintomas para o corpo do pdf (2 colunas)
    const [sintomasLista] = await pool.query(
      "SELECT codigo, nome FROM sintomas_pesos ORDER BY categoria, id",
    );
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
    const ch = checklist[0];
    const c0 = consulta[0];
    const AZUL = "#1a6fff";
    const PRETO = "#0a0a0a";
    const CINZA = "#888888";
    const CINZA_CLARO = "#e8e8e8";
    const encCor = {
      observacao: AZUL,
      auxilio_clinico: "#e8a020",
      medicacao: "#e02020",
    };

    // ---------- cabeçalho institucional (faixa preta + filete azul) ----------
    doc.rect(0, 0, doc.page.width, 86).fill(PRETO);
    doc.rect(0, 86, doc.page.width, 3).fill(AZUL);
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("EU DIGO X", 50, 24, { characterSpacing: 4 });
    doc
      .fillColor("#8899bb")
      .font("Helvetica")
      .fontSize(8)
      .text("SISTEMA DE TRIAGEM CLÍNICA — SÍNDROME DO X FRÁGIL", 50, 56, {
        characterSpacing: 2,
      });
    doc
      .fontSize(8)
      .text(`LAUDO Nº ${String(consulta_id).padStart(5, "0")}`, 0, 26, {
        align: "right",
        width: doc.page.width - 50,
      })
      .text(new Date().toLocaleDateString("pt-BR"), 0, 40, {
        align: "right",
        width: doc.page.width - 50,
      });

    // ---------- título ----------
    let y = 112;
    doc
      .fillColor(PRETO)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("LAUDO DE AVALIAÇÃO CLÍNICA", 50, y);
    y += 30;

    // ---------- identificação em duas colunas (paciente | consulta) ----------
    const col1 = 50;
    const col2 = 312;
    const larguraCol = 250;

    function linhaInfo(x, yy, rotulo, valor) {
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(CINZA)
        .text(rotulo.toUpperCase(), x, yy, { characterSpacing: 1 });
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(PRETO)
        .text(valor || "—", x, yy + 9, { width: larguraCol - 10 });
      return yy + 26;
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(AZUL)
      .text("PACIENTE", col1, y, { characterSpacing: 2 })
      .text("CONSULTA", col2, y, { characterSpacing: 2 });
    doc
      .moveTo(col1, y + 13)
      .lineTo(col1 + larguraCol, y + 13)
      .strokeColor(CINZA_CLARO)
      .stroke();
    doc
      .moveTo(col2, y + 13)
      .lineTo(col2 + larguraCol, y + 13)
      .stroke();

    let y1 = y + 20;
    let y2 = y + 20;
    y1 = linhaInfo(col1, y1, "Nome", c0.paciente_nome);
    y1 = linhaInfo(col1, y1, "CPF", c0.paciente_cpf);
    y1 = linhaInfo(col1, y1, "Sexo", ch.paciente_sexo === "F" ? "Feminino" : "Masculino");
    y1 = linhaInfo(col1, y1, "Responsável", ch.nome_responsavel);

    y2 = linhaInfo(col2, y2, "Médico responsável", c0.medico_nome + (ch.crm ? ` — CRM ${ch.crm}` : ""));
    y2 = linhaInfo(col2, y2, "Especialidade", ch.especialidade);
    y2 = linhaInfo(col2, y2, "Data da consulta", new Date(c0.data_consulta).toLocaleDateString("pt-BR"));
    y2 = linhaInfo(col2, y2, "Checklist preenchido por", ch.preenchido_por === "medico" ? "Médico" : "Responsável");

    y = Math.max(y1, y2) + 6;

    // ---------- resultado da avaliação ----------
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(AZUL)
      .text("RESULTADO DA AVALIAÇÃO", col1, y, { characterSpacing: 2 });
    doc.moveTo(col1, y + 13).lineTo(562, y + 13).strokeColor(CINZA_CLARO).stroke();
    y += 24;

    const scorePond = Number(ch.score_ponderado);
    const limiar = Number(ch.limiar_usado);
    const acima = scorePond >= limiar;

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(CINZA)
      .text("SCORE TOTAL (SOMA SIMPLES)", col1, y, { characterSpacing: 1 });
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor(PRETO)
      .text(`${ch.score_total} / ${sintomasLista.length}`, col1, y + 10);

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(CINZA)
      .text("SCORE PONDERADO POR SEXO", col2, y, { characterSpacing: 1 });
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor(acima ? "#e02020" : AZUL)
      .text(scorePond.toFixed(4), col2, y + 10);
    y += 44;

    // barra do score ponderado com o marcador do limiar (desenho vetorial)
    const barX = col1;
    const barW = 512;
    const barH = 9;
    doc.roundedRect(barX, y, barW, barH, 4).fill(CINZA_CLARO);
    if (scorePond > 0) {
      doc
        .roundedRect(barX, y, Math.min(scorePond, 1) * barW, barH, 4)
        .fill(acima ? "#e02020" : AZUL);
    }
    const tickX = barX + Math.min(limiar, 1) * barW;
    doc.rect(tickX - 1, y - 3, 2, barH + 6).fill(PRETO);
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(CINZA)
      .text("0.00", barX, y + 13)
      .text(
        `limiar ${limiar.toFixed(2)} (${ch.paciente_sexo === "F" ? "feminino" : "masculino"})`,
        tickX - 60,
        y + 13,
        { width: 120, align: "center" },
      )
      .text("1.00", barX + barW - 25, y + 13, { width: 25, align: "right" });
    y += 32;

    // box destacado do encaminhamento
    const encTexto = ENCAMINHAMENTO_LABEL[ch.encaminhamento] || ch.encaminhamento;
    const cor = encCor[ch.encaminhamento] || CINZA;
    doc.roundedRect(col1, y, 512, 30, 4).lineWidth(1.2).strokeColor(cor).stroke();
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(CINZA)
      .text("ENCAMINHAMENTO", col1 + 12, y + 6, { characterSpacing: 1 });
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(cor)
      .text(encTexto, col1 + 12, y + 15);
    y += 44;

    // ---------- sintomas avaliados (2 colunas de 6 com caixinhas) ----------
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(AZUL)
      .text("SINTOMAS AVALIADOS", col1, y, { characterSpacing: 2 });
    doc.moveTo(col1, y + 13).lineTo(562, y + 13).strokeColor(CINZA_CLARO).stroke();
    y += 22;

    const metade = Math.ceil(sintomasLista.length / 2);
    sintomasLista.forEach((sint, i) => {
      const x = i < metade ? col1 : col2;
      const yy = y + (i % metade) * 17;
      const marcado = !!ch[sint.codigo];
      doc
        .rect(x, yy, 9, 9)
        .lineWidth(0.8)
        .strokeColor(marcado ? AZUL : "#cccccc")
        .stroke();
      if (marcado) {
        doc.rect(x + 1.5, yy + 1.5, 6, 6).fill(AZUL);
      }
      doc
        .font(marcado ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9)
        .fillColor(marcado ? PRETO : CINZA)
        .text(sint.nome, x + 16, yy + 0.5, { width: 235, height: 12, ellipsis: true });
    });
    y += metade * 17 + 10;

    // ---------- observações clínicas (se houver) ----------
    if (ch.observacoes) {
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(AZUL)
        .text("OBSERVAÇÕES CLÍNICAS", col1, y, { characterSpacing: 2 });
      doc.moveTo(col1, y + 13).lineTo(562, y + 13).strokeColor(CINZA_CLARO).stroke();
      y += 20;
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#444444")
        .text(ch.observacoes, col1, y, { width: 512, height: 56, ellipsis: true });
      y += Math.min(doc.heightOfString(ch.observacoes, { width: 512 }), 56) + 14;
    }

    // ---------- assinatura ----------
    const assinaturaY = Math.max(y + 28, 640);
    doc.moveTo(col1, assinaturaY).lineTo(col1 + 220, assinaturaY).strokeColor("#999999").stroke();
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(CINZA)
      .text(`${c0.medico_nome}${ch.crm ? ` — CRM ${ch.crm}` : ""}`, col1, assinaturaY + 5)
      .text("Assinatura do médico responsável", col1, assinaturaY + 16);

    // ---------- rodapé ----------
    // zera a margem inferior para o texto do rodapé não disparar
    // a quebra automática de página do pdfkit
    doc.page.margins.bottom = 0;
    const rodapeY = doc.page.height - 70;
    doc.moveTo(50, rodapeY).lineTo(562, rodapeY).strokeColor(CINZA_CLARO).stroke();
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#999999")
      .text(
        "Este documento é uma ferramenta de apoio à triagem clínica e não substitui a avaliação médica presencial nem o exame genético confirmatório (PCR/Southern Blot).",
        50,
        rodapeY + 8,
        { width: 512, align: "center" },
      )
      .text(
        `Gerado em ${new Date().toLocaleString("pt-BR")} — Eu Digo X · dados protegidos nos termos da LGPD (Lei nº 13.709/2018)`,
        50,
        rodapeY + 28,
        { width: 512, align: "center" },
      );
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
      "SELECT id, nome, crm, especialidade, foto FROM usuarios WHERE id = ?",
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
