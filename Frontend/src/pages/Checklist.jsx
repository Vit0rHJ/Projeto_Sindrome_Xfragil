import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = "http://localhost:3001";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// 12 sintomas exatos do banco (colunas sin_* da tabela checklist)
//os sintomas antigos estavam incorretos ja substitui eles pelos certos
const SINTOMAS = [
  {
    id: "sin_atraso_fala",
    label: "Atraso na fala",
    desc: "Demorou para falar ou desenvolver linguagem",
  },
  {
    id: "sin_dif_aprendizado",
    label: "Dificuldade de aprendizado",
    desc: "Dificuldades no aprendizado escolar",
  },
  {
    id: "sin_deficit_atencao",
    label: "Déficit de atenção",
    desc: "Dificuldade de concentração e foco",
  },
  {
    id: "sin_def_intelectual",
    label: "Deficiência intelectual",
    desc: "Dificuldades de aprendizagem e desenvolvimento cognitivo",
  },
  {
    id: "sin_hiperatividade",
    label: "Hiperatividade",
    desc: "Agitação, impulsividade e déficit de atenção",
  },
  {
    id: "sin_agressividade",
    label: "Agressividade",
    desc: "Comportamentos agressivos recorrentes",
  },
  {
    id: "sin_evita_contato_visual",
    label: "Evita contato visual",
    desc: "Dificuldade em manter contato visual",
  },
  {
    id: "sin_evita_contato_fisico",
    label: "Evita contato físico",
    desc: "Aversão a toque ou contato físico",
  },
  {
    id: "sin_movimentos_repetitivos",
    label: "Movimentos repetitivos",
    desc: "Movimentos intencionais, repetitivos e ritmados",
  },
  {
    id: "sin_frouxidao",
    label: "Frouxidão ligamentar",
    desc: "Articulações mais flexíveis que o normal",
  },
  {
    id: "sin_macroquidia",
    label: "Macroquidia",
    desc: "Testículos de tamanho maior que o normal",
  },
  {
    id: "sin_face_alongada",
    label: "Face alongada",
    desc: "Face alongada, mandíbula proeminente e/ou orelhas de abano",
  },
];

const encaminhamentoConfig = {
  observacao: {
    label: "Observação",
    desc: "Score baixo (≤ 3). Monitoramento clínico recomendado.",
    color: "#1448a8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  auxilio_clinico: {
    label: "Auxílio Clínico",
    desc: "Score moderado (4–7). Encaminhamento para especialista recomendado.",
    color: "#0f3494",
    bg: "#dbeafe",
    border: "#93c5fd",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  medicacao: {
    label: "Medicação",
    desc: "Score alto (≥ 8). Avaliação para tratamento medicamentoso e investigação genética.",
    color: "#ffffff",
    bg: "#1448a8",
    border: "#0f3494",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3" />
        <circle cx="18" cy="18" r="4" />
        <path d="M15.6 15.6l4.8 4.8" />
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
    setMarcados((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const totalMarcados = Object.values(marcados).filter(Boolean).length;

  async function handleSubmit() {
    if (!consultaId) {
      setErro("Nenhuma consulta selecionada. Cadastre um paciente primeiro.");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      // Monta o body com cada sin_* como boolean
      const body = { consulta_id: Number(consultaId) };
      SINTOMAS.forEach((s) => {
        body[s.id] = !!marcados[s.id];
      });

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

  const enc = resultado?.encaminhamento
    ? encaminhamentoConfig[resultado.encaminhamento]
    : null;

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h1 style={styles.title}>Checklist de Sintomas</h1>
        <p style={styles.subtitle}>
          {consultaId
            ? `Consulta #${consultaId} — marque os sintomas observados no paciente`
            : "⚠️ Nenhuma consulta selecionada — acesse pelo cadastro do paciente"}
        </p>
      </div>

      {/* Barra de progresso */}
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
          <div
            style={{
              ...styles.progressFill,
              width: `${(totalMarcados / SINTOMAS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Grid de sintomas */}
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
                <div
                  style={{
                    ...styles.checkbox,
                    background: checked ? "#1448a8" : "white",
                    border: checked ? "none" : "2px solid #cbd5e1",
                  }}
                >
                  {checked && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div style={styles.sintomaInfo}>
                  <span
                    style={{
                      ...styles.sintomaLabel,
                      color: checked ? "#1448a8" : "#1e293b",
                    }}
                  >
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
        <div
          style={{
            ...styles.resultCard,
            background: enc.bg,
            border: `1.5px solid ${enc.border}`,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: enc.color,
                flexShrink: 0,
              }}
            >
              {enc.icon}
            </div>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: enc.color,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  margin: "0 0 4px 0",
                }}
              >
                Encaminhamento gerado — score:{" "}
                {resultado.score_total ?? totalMarcados}/12
              </p>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: enc.color === "#ffffff" ? "white" : "#0a2560",
                  margin: "0 0 6px 0",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {enc.label}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color:
                    enc.color === "#ffffff"
                      ? "rgba(255,255,255,0.85)"
                      : "#475569",
                  margin: 0,
                }}
              >
                {enc.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {erro && (
        <div style={styles.errorBox}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {erro}
        </div>
      )}

      {/* Ações */}
      <div style={styles.actions}>
        {!resultado ? (
          <>
            <button onClick={() => navigate("/home")} style={styles.cancelBtn}>
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || totalMarcados === 0 || !consultaId}
              style={{
                ...styles.submitBtn,
                opacity: totalMarcados === 0 || !consultaId ? 0.5 : 1,
              }}
            >
              {loading
                ? "Salvando..."
                : `Gerar Encaminhamento (${totalMarcados})`}
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
    fontSize: "26px",
    fontWeight: 700,
    color: "#0a2560",
    margin: "0 0 6px 0",
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
    width: "22px",
    height: "22px",
    borderRadius: "6px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1px",
    transition: "all 0.15s",
  },
  sintomaInfo: { display: "flex", flexDirection: "column", gap: "3px" },
  sintomaLabel: { fontSize: "14px", fontWeight: 600, lineHeight: 1.3 },
  sintomaDesc: { fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 },
  resultCard: { borderRadius: "16px", padding: "24px 28px" },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "10px",
    color: "#e11d48",
    fontSize: "13px",
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
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    padding: "11px 28px",
    background: "linear-gradient(135deg, #1448a8, #1e6fd9)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 14px rgba(20,72,168,0.25)",
  },
};
