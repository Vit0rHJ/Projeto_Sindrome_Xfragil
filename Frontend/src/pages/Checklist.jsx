import { useState } from "react";

const itensChecklist = [
  { id: 1,  categoria: "Avaliação Inicial",    label: "Anamnese completa realizada" },
  { id: 2,  categoria: "Avaliação Inicial",    label: "Histórico familiar documentado" },
  { id: 3,  categoria: "Avaliação Inicial",    label: "Exame físico geral realizado" },
  { id: 4,  categoria: "Avaliação Cognitiva",  label: "Teste de linguagem aplicado" },
  { id: 5,  categoria: "Avaliação Cognitiva",  label: "Avaliação de memória de trabalho" },
  { id: 6,  categoria: "Avaliação Cognitiva",  label: "Escala de comportamento preenchida" },
  { id: 7,  categoria: "Exames Solicitados",   label: "Cariótipo / teste molecular solicitado" },
  { id: 8,  categoria: "Exames Solicitados",   label: "Eletroencefalograma indicado" },
  { id: 9,  categoria: "Acompanhamento",       label: "Encaminhamento para fonoaudiologia" },
  { id: 10, categoria: "Acompanhamento",       label: "Encaminhamento para terapia ocupacional" },
  { id: 11, categoria: "Acompanhamento",       label: "Orientações entregues à família" },
  { id: 12, categoria: "Acompanhamento",       label: "Próxima consulta agendada" },
];

export function Checklist() {
  const [marcados, setMarcados] = useState({});
  const [paciente, setPaciente] = useState("");
  const [salvo, setSalvo] = useState(false);

  function toggle(id) {
    setMarcados((prev) => ({ ...prev, [id]: !prev[id] }));
    setSalvo(false);
  }

  const total = itensChecklist.length;
  const concluidos = Object.values(marcados).filter(Boolean).length;
  const progresso = Math.round((concluidos / total) * 100);
  const categorias = [...new Set(itensChecklist.map((i) => i.categoria))];

  function handleSalvar() {
    if (!paciente.trim()) return;
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Checklist de Consulta</h1>
          <p style={styles.subtitle}>Registro clínico para acompanhamento do paciente</p>
        </div>
        <div style={styles.progressBadge}>
          <svg width="56" height="56" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#dbeafe" strokeWidth="4"/>
            <circle
              cx="18" cy="18" r="14" fill="none"
              stroke="#2563eb" strokeWidth="4"
              strokeDasharray={`${progresso * 0.879} 100`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
              style={{ transition: "stroke-dasharray 0.4s" }}
            />
          </svg>
          <span style={styles.progressText}>{progresso}%</span>
        </div>
      </div>

      {/* Campo paciente */}
      <div style={styles.card}>
        <label style={styles.label}>Nome do Paciente</label>
        <input
          style={styles.pacienteInput}
          type="text"
          placeholder="Ex: João Pedro Almeida"
          value={paciente}
          onChange={(e) => { setPaciente(e.target.value); setSalvo(false); }}
        />
      </div>

      {/* Barra de progresso */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={styles.label}>Progresso da consulta</span>
          <span style={{ fontSize: "13px", color: "#2563eb", fontWeight: 700 }}>{concluidos} / {total} itens</span>
        </div>
        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBarFill, width: `${progresso}%` }} />
        </div>
      </div>

      {/* Itens por categoria */}
      {categorias.map((cat) => (
        <div key={cat} style={styles.card}>
          <h3 style={styles.catTitle}>
            <span style={styles.catDot} />{cat}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {itensChecklist.filter((item) => item.categoria === cat).map((item) => {
              const checked = !!marcados[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  style={{ ...styles.itemBtn, background: checked ? "#eff6ff" : "white", borderColor: checked ? "#93c5fd" : "#e2e8f0" }}
                >
                  <div style={{ ...styles.checkbox, background: checked ? "#2563eb" : "white", borderColor: checked ? "#2563eb" : "#cbd5e1" }}>
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ ...styles.itemLabel, color: checked ? "#1448a8" : "#334155", textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.75 : 1 }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Botão salvar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "16px", paddingBottom: "20px" }}>
        {salvo && (
          <div style={styles.sucessoMsg}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Checklist salvo com sucesso!
          </div>
        )}
        <button
          style={{ ...styles.btnSalvar, opacity: !paciente.trim() ? 0.55 : 1, cursor: !paciente.trim() ? "not-allowed" : "pointer" }}
          onClick={handleSalvar}
          disabled={!paciente.trim()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Salvar Checklist
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'DM Sans', sans-serif", maxWidth: "720px" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#0a2560", marginBottom: "4px" },
  subtitle: { fontSize: "14px", color: "#64748b" },
  progressBadge: { position: "relative", width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center" },
  progressText: { position: "absolute", fontSize: "11px", fontWeight: 700, color: "#2563eb" },
  card: { background: "white", borderRadius: "14px", padding: "20px", border: "1px solid #dbeafe", boxShadow: "0 2px 10px rgba(37,99,235,0.05)" },
  label: { fontSize: "13px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "8px" },
  pacienteInput: { width: "100%", padding: "10px 14px", border: "1.5px solid #dbeafe", borderRadius: "10px", fontSize: "14px", color: "#0a2560", background: "#f8fbff", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  progressBarBg: { height: "8px", background: "#dbeafe", borderRadius: "8px", overflow: "hidden" },
  progressBarFill: { height: "100%", background: "linear-gradient(90deg, #1448a8, #2563eb)", borderRadius: "8px", transition: "width 0.35s ease" },
  catTitle: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: "#0a2560", marginBottom: "14px", letterSpacing: "0.02em" },
  catDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb", flexShrink: 0 },
  itemBtn: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid", cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" },
  checkbox: { width: "20px", height: "20px", borderRadius: "6px", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" },
  itemLabel: { fontSize: "14px", fontWeight: 500, transition: "all 0.15s" },
  sucessoMsg: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#166534", background: "#dcfce7", padding: "8px 16px", borderRadius: "8px", fontWeight: 500 },
  btnSalvar: { display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #1448a8, #2563eb)", color: "white", border: "none", borderRadius: "10px", padding: "12px 22px", fontSize: "14px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.2s" },
};