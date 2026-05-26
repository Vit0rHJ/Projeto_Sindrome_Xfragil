export function Home() {
  const cards = [
    {
      label: "Pacientes Cadastrados", value: "128",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      bg: "linear-gradient(135deg, #1448a8, #2563eb)",
    },
    {
      label: "Consultas Este Mês", value: "34",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      bg: "linear-gradient(135deg, #0369a1, #0ea5e9)",
    },
    {
      label: "Checklists Pendentes", value: "7",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      bg: "linear-gradient(135deg, #0f766e, #14b8a6)",
    },
    {
      label: "Profissionais Ativos", value: "12",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4"/>
          <path d="M3 20c0-4 4-7 9-7s9 3 9 7"/>
          <path d="M16 11l1.5 1.5L20 10"/>
        </svg>
      ),
      bg: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    },
  ];

  const recentActivities = [
    { time: "09:30", paciente: "Ana Paula Ferreira", acao: "Checklist de consulta concluído", tipo: "checklist" },
    { time: "10:15", paciente: "Carlos Eduardo Lima", acao: "Novo cadastro realizado", tipo: "cadastro" },
    { time: "11:00", paciente: "Beatriz Santos", acao: "Consulta agendada", tipo: "consulta" },
    { time: "13:45", paciente: "Rafael Oliveira", acao: "Checklist de consulta concluído", tipo: "checklist" },
    { time: "15:20", paciente: "Mariana Costa", acao: "Novo cadastro realizado", tipo: "cadastro" },
  ];

  const tipoColor = {
    checklist: { bg: "#dbeafe", color: "#1448a8" },
    cadastro:  { bg: "#dcfce7", color: "#166534" },
    consulta:  { bg: "#fef9c3", color: "#854d0e" },
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Painel Principal</h1>
          <p style={styles.subtitle}>Bem-vindo(a) ao sistema de gestão clínica</p>
        </div>
        <div style={styles.dateBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {/* Cards */}
      <div style={styles.cardsGrid}>
        {cards.map((c) => (
          <div key={c.label} style={styles.card}>
            <div style={{ ...styles.cardIcon, background: c.bg }}>{c.icon}</div>
            <div>
              <div style={styles.cardValue}>{c.value}</div>
              <div style={styles.cardLabel}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Atividades recentes */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Atividades Recentes</h2>
        <div style={styles.activityList}>
          {recentActivities.map((a, i) => (
            <div key={i} style={styles.activityItem}>
              <span style={styles.activityTime}>{a.time}</span>
              <div style={styles.activityDot} />
              <div style={styles.activityContent}>
                <span style={styles.activityPaciente}>{a.paciente}</span>
                <span style={styles.activityAcao}>{a.acao}</span>
              </div>
              <span style={{ ...styles.activityTag, background: tipoColor[a.tipo].bg, color: tipoColor[a.tipo].color }}>
                {a.tipo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "32px", fontFamily: "'DM Sans', sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#0a2560", marginBottom: "4px" },
  subtitle: { fontSize: "14px", color: "#64748b" },
  dateBadge: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "white", border: "1px solid #dbeafe", borderRadius: "10px", fontSize: "13px", color: "#334155", fontWeight: 500, boxShadow: "0 1px 6px rgba(37,99,235,0.06)" },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  card: { background: "white", borderRadius: "16px", padding: "22px", display: "flex", alignItems: "center", gap: "16px", border: "1px solid #dbeafe", boxShadow: "0 2px 12px rgba(37,99,235,0.06)" },
  cardIcon: { width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardValue: { fontSize: "28px", fontWeight: 700, color: "#0a2560", lineHeight: 1.1 },
  cardLabel: { fontSize: "13px", color: "#64748b", marginTop: "2px" },
  section: { background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #dbeafe", boxShadow: "0 2px 12px rgba(37,99,235,0.06)" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#0a2560", marginBottom: "20px" },
  activityList: { display: "flex", flexDirection: "column" },
  activityItem: { display: "flex", alignItems: "center", gap: "16px", padding: "14px 0", borderBottom: "1px solid #f1f5f9" },
  activityTime: { fontSize: "12px", color: "#94a3b8", fontWeight: 600, minWidth: "38px" },
  activityDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb", flexShrink: 0 },
  activityContent: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  activityPaciente: { fontSize: "14px", fontWeight: 600, color: "#0a2560" },
  activityAcao: { fontSize: "12px", color: "#64748b" },
  activityTag: { fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", textTransform: "capitalize", letterSpacing: "0.02em" },
};