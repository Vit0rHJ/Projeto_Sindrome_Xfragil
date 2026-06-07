import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "http://localhost:3001";
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function getUserFromToken() {
  try { return JSON.parse(atob(localStorage.getItem("token").split(".")[1])); }
  catch { return {}; }
}

export function Laudo() {
  const { consulta_id } = useParams();
  const navigate = useNavigate();
  const [laudo, setLaudo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const medico = getUserFromToken();

  useEffect(() => {
    fetch(`${API}/api/laudos/${consulta_id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { if (data.error || data.message?.includes("não")) throw new Error(data.message); setLaudo(data); })
      .catch(e => setErro(e.message || "Erro ao carregar laudo"))
      .finally(() => setLoading(false));
  }, [consulta_id]);

  if (loading) return <div style={styles.center}><p style={{ color: "#64748b" }}>Carregando laudo...</p></div>;
  if (erro)    return (
    <div style={styles.center}>
      <p style={{ color: "#e11d48", marginBottom: "16px" }}>⚠️ {erro}</p>
      <button onClick={() => navigate("/home")} style={styles.backBtn}>← Voltar ao Início</button>
    </div>
  );

  const paciente  = laudo?.paciente  || {};
  const checklist = laudo?.checklist || {};
  const consulta  = laudo?.consulta  || {};
  const score     = checklist.score_total ?? 0;
  const enc       = checklist.encaminhamento || "observacao";

  const encLabels = {
    observacao:     { label: "Observação",    cor: "#1448a8", bg: "#eff6ff" },
    auxilio_clinico:{ label: "Auxílio Clínico", cor: "#0f3494", bg: "#dbeafe" },
    medicacao:      { label: "Medicação",     cor: "#ffffff", bg: "#1448a8" },
  };
  const encCfg = encLabels[enc] || encLabels.observacao;

  const dataConsulta = consulta.data_consulta
    ? new Date(consulta.data_consulta).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  return (
    <div style={styles.page}>
      {/* Toolbar */}
      <div style={styles.toolbar} className="no-print">
        <button onClick={() => navigate("/home")} style={styles.backBtn}>← Voltar</button>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate(`/checklist?consulta_id=${consulta_id}`)} style={styles.backBtn}>
            Refazer Checklist
          </button>
          <button onClick={() => window.print()} style={styles.printBtn}>🖨️ Imprimir / PDF</button>
        </div>
      </div>

      {/* Laudo */}
      <div style={styles.laudoWrap}>
        {/* Cabeçalho */}
        <div style={styles.laudoHeader}>
          <div>
            <h1 style={styles.laudoTitulo}>Laudo Clínico</h1>
            <p style={styles.laudoSub}>Síndrome X Frágil — Checklist de Triagem · Consulta #{consulta_id}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>
              {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Paciente */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Dados do Paciente</h2>
          <div style={styles.grid3}>
            {[
              ["Nome",              paciente.nome],
              ["CPF",               paciente.cpf],
              ["Data de Nasc.",     paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString("pt-BR") : "—"],
              ["Responsável",       paciente.nome_responsavel],
              ["Tel. Responsável",  paciente.telefone_responsavel],
              ["Data da Consulta",  dataConsulta],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={styles.dataLabel}>{l}</div>
                <div style={styles.dataValue}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Médico */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Responsável pelo Atendimento</h2>
          <div style={styles.grid3}>
            {[
              ["Médico",       laudo?.medico?.nome || medico.nome],
              ["CRM",          laudo?.medico?.crm  || medico.crm],
              ["Especialidade",laudo?.medico?.especialidade || medico.especialidade],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={styles.dataLabel}>{l}</div>
                <div style={styles.dataValue}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Score */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Resultado do Checklist</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "16px" }}>
            <div style={styles.scoreBig}>
              <span style={styles.scoreNum}>{score}</span>
              <span style={{ fontSize: "20px", color: "#94a3b8" }}>/12</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "10px" }}>
                {score <= 3 ? "Score baixo — monitoramento clínico recomendado."
                 : score <= 7 ? "Score moderado — encaminhamento para especialista indicado."
                 : "Score alto — avaliação para tratamento e investigação genética urgente."}
              </p>
              <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(score/12)*100}%`, background: "linear-gradient(90deg, #1448a8, #0f3494)", borderRadius: "4px" }}/>
              </div>
            </div>
          </div>
        </section>

        {/* Encaminhamento */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Encaminhamento</h2>
          <div style={{ ...styles.encBox, background: encCfg.bg }}>
            <div style={{ ...styles.encTipo, color: encCfg.cor }}>{encCfg.label}</div>
            <div style={{ fontSize: "13px", color: encCfg.cor === "#ffffff" ? "rgba(255,255,255,0.85)" : "#475569", lineHeight: 1.6 }}>
              {enc === "observacao"     && "Manter acompanhamento clínico regular. Reavaliação em 3 a 6 meses."}
              {enc === "auxilio_clinico"&& "Encaminhar para avaliação multidisciplinar: fonoaudiologia, terapia ocupacional e psicologia."}
              {enc === "medicacao"      && "Solicitar teste de DNA (PCR + Southern Blot) e encaminhar para geneticista. Considerar suporte farmacológico para comorbidades."}
            </div>
          </div>
        </section>

        <div style={styles.laudoFooter}>
          <p>Documento gerado pela plataforma X Frágil Gestão Clínica. Não substitui avaliação clínica presencial.</p>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}

const styles = {
  page:        { display: "flex", flexDirection: "column", gap: "20px" },
  center:      { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px", textAlign: "center" },
  toolbar:     { display: "flex", justifyContent: "space-between", alignItems: "center" },
  backBtn:     { padding: "9px 16px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#475569", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  printBtn:    { padding: "9px 18px", background: "linear-gradient(135deg, #1448a8, #1e6fd9)", border: "none", borderRadius: "8px", fontSize: "13px", color: "white", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  laudoWrap:   { background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 12px rgba(20,72,168,0.06)" },
  laudoHeader: { background: "linear-gradient(135deg, #061a4a, #1448a8)", padding: "32px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  laudoTitulo: { fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "white", margin: "0 0 4px 0" },
  laudoSub:    { fontSize: "13px", color: "rgba(255,255,255,0.65)", margin: 0 },
  section:     { padding: "24px 36px", borderBottom: "1px solid #f1f5f9" },
  sectionTitle:{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" },
  grid3:       { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  dataLabel:   { fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" },
  dataValue:   { fontSize: "14px", color: "#1a1a2e", fontWeight: 500 },
  scoreBig:    { background: "#f0f6ff", borderRadius: "14px", padding: "16px 24px", textAlign: "center", flexShrink: 0, border: "1px solid #dbeafe" },
  scoreNum:    { fontFamily: "'Playfair Display', serif", fontSize: "44px", fontWeight: 900, color: "#1448a8" },
  encBox:      { borderRadius: "12px", padding: "20px 24px", border: "1px solid #dbeafe" },
  encTipo:     { fontSize: "16px", fontWeight: 700, marginBottom: "8px" },
  laudoFooter: { padding: "16px 36px", background: "#f8faff", fontSize: "11px", color: "#94a3b8", lineHeight: 1.8 },
};
