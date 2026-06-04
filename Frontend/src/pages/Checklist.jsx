import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = "http://localhost:3001";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const SINTOMAS = [
  { id: "deficiencia_intelectual", label: "Deficiência intelectual", desc: "Dificuldades de aprendizagem e desenvolvimento cognitivo" },
  { id: "atraso_fala", label: "Atraso na fala/linguagem", desc: "Desenvolvimento tardio da comunicação verbal" },
  { id: "comportamento_autista", label: "Comportamento autista", desc: "Características do espectro autista" },
  { id: "hiperatividade", label: "Hiperatividade / TDAH", desc: "Agitação, impulsividade e déficit de atenção" },
  { id: "ansiedade", label: "Ansiedade", desc: "Transtornos de ansiedade significativos" },
  { id: "macrorquidia", label: "Macrorquidia", desc: "Testículos aumentados (pós-puberdade)" },
  { id: "face_alongada", label: "Face alongada", desc: "Características faciais típicas da síndrome" },
  { id: "orelhas_proeminentes", label: "Orelhas proeminentes", desc: "Orelhas grandes ou salientes" },
  { id: "hipotonia", label: "Hipotonia muscular", desc: "Tônus muscular reduzido" },
  { id: "hipermobilidade", label: "Hipermobilidade articular", desc: "Articulações com mobilidade excessiva" },
  { id: "historico_familiar", label: "Histórico familiar", desc: "Casos de X Frágil na família" },
  { id: "convulsoes", label: "Convulsões / epilepsia", desc: "Episódios convulsivos registrados" },
];

const encaminhamentoConfig = {
  observacao: {
    label: "Observação",
    desc: "Monitoramento clínico recomendado",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  auxilio_clinico: {
    label: "Auxílio Clínico",
    desc: "Encaminhamento para especialista recomendado",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  medicacao: {
    label: "Medicação",
    desc: "Avaliação para tratamento medicamentoso",
    color: "#e11d48",
    bg: "#fff1f2",
    border: "#fecdd3",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/>
        <circle cx="18" cy="18" r="4"/><path d="M15.6 15.6l4.8 4.8"/>
      </svg>
    ),
  },
};

export function Checklist() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultaId = searchParams.get("consulta_id");

  const [marcados, setMarcados] = useState({});
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function toggleSintoma(id) {
    if (resultado) return;
    setMarcados(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const totalMarcados = Object.values(marcados).filter(Boolean).length;

  async function handleSubmit() {
    setLoading(true);
    setErro("");
    try {
      const sintomas = Object.entries(marcados)
        .filter(([, v]) => v)
        .map(([k]) => k);

      const body = { sintomas, consulta_id: consultaId || undefined };

      const res = await fetch(`${API}/api/checklist`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao salvar checklist");
      setResultado(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  const enc = resultado?.encaminhamento ? encaminhamentoConfig[resultado.encaminhamento] : null;

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h1 style={styles.title}>Checklist de Sintomas</h1>
        <p style={styles.subtitle}>Marque os sintomas observados no paciente para gerar o encaminhamento adequado</p>
      </div>

      {/* Progress bar */}
      <div style={styles.progressCard}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>
            {totalMarcados} de {SINTOMAS.length} sintomas marcados
          </span>
          <span style={styles.progressPercent}>
            {Math.round((totalMarcados / SINTOMAS.length) * 100)}%
          </span>
        </div>
        <div style={styles.progressTrack}>
          <div style={{
            ...styles.progressFill,
            width: `${(totalMarcados / SINTOMAS.length) * 100}%`,
          }} />
        </div>
      </div>

      {/* Sintomas grid */}
      {!resultado && (
        <div style={styles.sintomasGrid}>
          {SINTOMAS.map((s) => {
            const checked = !!marcados[s.id];
            return (
              <div
                key={s.id}
                onClick={() => toggleSintoma(s.id)}
                style={{
                  ...styles.sintomaCard,
                  border: checked
                    ? "1.5px solid #1448a8"
                    : "1.5px solid #e2e8f0",
                  background: checked ? "#eff6ff" : "white",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  ...styles.checkbox,
                  background: checked ? "#1448a8" : "white",
                  border: checked ? "none" : "2px solid #cbd5e1",
                }}>
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <div style={styles.sintomaInfo}>
                  <span style={{
                    ...styles.sintomaLabel,
                    color: checked ? "#1448a8" : "#1e293b",
                  }}>
                    {s.label}
                  </span>
                  <span style={styles.sintomaDesc}>{s.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resultado */}
      {resultado && enc && (
        <div style={{
          ...styles.resultCard,
          background: enc.bg,
          border: `1.5px solid ${enc.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: `${enc.color}1a`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: enc.color, flexShrink: 0,
            }}>
              {enc.icon}
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: enc.color, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px 0" }}>
                Encaminhamento gerado
              </p>
              <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#0a2560", margin: "0 0 6px 0", fontFamily: "'Playfair Display', serif" }}>
                {enc.label}
              </h3>
              <p style={{ fontSize: "14px", color: "#475569", margin: 0 }}>{enc.desc}</p>
              {resultado.observacao && (
                <p style={{ marginTop: "12px", fontSize: "14px", color: "#374151", background: "rgba(255,255,255,0.6)", borderRadius: "8px", padding: "10px 14px" }}>
                  {resultado.observacao}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {erro && (
        <div style={styles.errorBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {erro}
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        {!resultado ? (
          <>
            <button onClick={() => navigate("/home")} style={styles.cancelBtn}>
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || totalMarcados === 0}
              style={{
                ...styles.submitBtn,
                opacity: totalMarcados === 0 ? 0.5 : 1,
                cursor: totalMarcados === 0 ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Salvando..." : `Gerar Encaminhamento (${totalMarcados})`}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/home")} style={styles.cancelBtn}>
              Voltar ao Início
            </button>
            {resultado.consulta_id && (
              <button
                onClick={() => navigate(`/laudo/${resultado.consulta_id}`)}
                style={styles.submitBtn}
              >
                Ver Laudo Completo
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  pageHeader: {},
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "26px", fontWeight: 700,
    color: "#0a2560", margin: "0 0 6px 0",
  },
  subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
  progressCard: {
    background: "white",
    borderRadius: "14px",
    padding: "20px 24px",
    border: "1px solid #e8f0fe",
    boxShadow: "0 2px 12px rgba(20,72,168,0.06)",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  progressLabel: { fontSize: "13px", color: "#64748b", fontWeight: 500 },
  progressPercent: { fontSize: "13px", fontWeight: 700, color: "#1448a8" },
  progressTrack: {
    height: "8px",
    background: "#e8f0fe",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #1448a8, #1e6fd9)",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },
  sintomasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "12px",
  },
  sintomaCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    borderRadius: "12px",
    transition: "all 0.15s",
    userSelect: "none",
  },
  checkbox: {
    width: "22px", height: "22px",
    borderRadius: "6px",
    flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginTop: "1px",
    transition: "all 0.15s",
  },
  sintomaInfo: { display: "flex", flexDirection: "column", gap: "3px" },
  sintomaLabel: { fontSize: "14px", fontWeight: 600, lineHeight: 1.3 },
  sintomaDesc: { fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 },
  resultCard: {
    borderRadius: "16px",
    padding: "24px 28px",
  },
  errorBox: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 16px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "10px",
    color: "#e11d48", fontSize: "13px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "4px",
  },
  cancelBtn: {
    padding: "11px 24px",
    background: "transparent",
    color: "#64748b",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px", fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    padding: "11px 28px",
    background: "linear-gradient(135deg, #1448a8, #1e6fd9)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px", fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 14px rgba(20,72,168,0.25)",
  },
};
