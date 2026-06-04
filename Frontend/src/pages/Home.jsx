import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3001";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { nome: "Médico", perfil: "medico" };
    return JSON.parse(atob(token.split(".")[1]));
  } catch (_) {
    return { nome: "Médico", perfil: "medico" };
  }
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ ...cardStyles.card, borderTop: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={cardStyles.label}>{label}</p>
          <p style={cardStyles.value}>{value}</p>
        </div>
        <div style={{ ...cardStyles.iconBox, background: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

const cardStyles = {
  card: {
    background: "white",
    borderRadius: "14px",
    padding: "20px 24px",
    boxShadow: "0 2px 12px rgba(20,72,168,0.06)",
    border: "1px solid #e8f0fe",
  },
  label: { fontSize: "13px", color: "#64748b", margin: "0 0 6px 0", fontWeight: 500 },
  value: { fontSize: "28px", fontWeight: 700, color: "#0a2560", margin: 0 },
  iconBox: {
    width: "40px", height: "40px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};

const statusConfig = {
  pendente: { label: "Pendente", bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  concluida: { label: "Concluída", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  cancelada: { label: "Cancelada", bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
};

export function Home() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUserFromToken();

  useEffect(() => {
    fetch(`${API}/api/consultas`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setConsultas(Array.isArray(data) ? data : []))
      .catch(() => setConsultas([]))
      .finally(() => setLoading(false));
  }, []);

  const pendentes = consultas.filter(c => c.status === "pendente");
  const concluidas = consultas.filter(c => c.status === "concluida");

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Olá, {user.nome?.split(" ")[0] || "Médico"} 👋
          </h1>
          <p style={styles.subtitle}>
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => navigate("/checklist")}
          style={styles.newBtn}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Consulta
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Total de Consultas"
          value={consultas.length}
          color="#1448a8"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <StatCard
          label="Pendentes"
          value={pendentes.length}
          color="#ea580c"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          label="Concluídas"
          value={concluidas.length}
          color="#16a34a"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
      </div>

      {/* Consultas Pendentes */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Consultas Pendentes</h2>
          {pendentes.length > 0 && (
            <span style={styles.badge}>{pendentes.length}</span>
          )}
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <p style={{ color: "#94a3b8" }}>Carregando...</p>
          </div>
        ) : pendentes.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p style={{ color: "#94a3b8", margin: "12px 0 0 0" }}>Nenhuma consulta pendente</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Paciente", "Data", "Status", "Ações"].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendentes.map((c, i) => {
                  const st = statusConfig[c.status] || statusConfig.pendente;
                  return (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? "white" : "#fafcff" }}>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={styles.avatarSmall}>
                            {(c.paciente_nome || c.paciente || "P").charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, color: "#1e293b" }}>
                            {c.paciente_nome || c.paciente || `Consulta #${c.id}`}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: "#64748b", fontSize: "13px" }}>
                          {c.data ? new Date(c.data).toLocaleDateString("pt-BR") : "—"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: st.bg,
                          color: st.color,
                          border: `1px solid ${st.border}`,
                        }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => navigate(`/checklist?consulta_id=${c.id}`)}
                          style={styles.actionBtn}
                        >
                          Ver checklist
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "26px",
    fontWeight: 700,
    color: "#0a2560",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    textTransform: "capitalize",
  },
  newBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  section: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e8f0fe",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(20,72,168,0.06)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "17px",
    fontWeight: 700,
    color: "#0a2560",
    margin: 0,
  },
  badge: {
    background: "#eff6ff",
    color: "#1448a8",
    border: "1px solid #bfdbfe",
    borderRadius: "20px",
    padding: "2px 9px",
    fontSize: "12px",
    fontWeight: 700,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 24px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px 24px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background: "#f8faff",
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "14px 24px",
    fontSize: "14px",
    borderBottom: "1px solid #f1f5f9",
  },
  avatarSmall: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1448a8, #1e6fd9)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
    flexShrink: 0,
  },
  actionBtn: {
    padding: "6px 14px",
    background: "#eff6ff",
    color: "#1448a8",
    border: "1px solid #bfdbfe",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
};
