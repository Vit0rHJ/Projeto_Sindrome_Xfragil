import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.senha) { setErro("Preencha todos os campos."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate("/home"); }, 900);
  }

  return (
    <div style={styles.wrapper}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Painel esquerdo */}
      <div style={styles.leftPanel}>
        <div style={styles.leftInner}>
          <div style={{ marginBottom: "28px" }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
              <path d="M20 14 Q32 24 44 14" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M20 22 Q32 32 44 22" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M20 30 Q32 40 44 30" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M20 38 Q32 48 44 38" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M20 46 Q32 56 44 46" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <line x1="20" y1="14" x2="20" y2="46" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <line x1="44" y1="14" x2="44" y2="46" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 style={styles.leftTitle}>Síndrome<br />X Frágil</h1>
          <p style={styles.leftSubtitle}>Plataforma clínica para acompanhamento<br />e gestão de pacientes</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {["Rastreamento clínico", "Prontuários digitais", "Checklists de consulta"].map(t => (
              <span key={t} style={styles.tag}>{t}</span>
            ))}
          </div>
        </div>
        <div style={styles.leftCircle1} />
        <div style={styles.leftCircle2} />
      </div>

      {/* Painel direito */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={{ marginBottom: "32px" }}>
            <h2 style={styles.formTitle}>Bem-vindo de volta</h2>
            <p style={styles.formSubtitle}>Acesse sua conta profissional</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>E-mail</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/>
                  </svg>
                </span>
                <input style={styles.input} type="email" name="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Senha</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input style={styles.input} type="password" name="senha" placeholder="••••••••" value={form.senha} onChange={handleChange} />
              </div>
            </div>

            {erro && (
              <div style={styles.erroBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {erro}
              </div>
            )}

            <button style={{ ...styles.btn, opacity: loading ? 0.75 : 1 }} type="submit" disabled={loading}>
              {loading ? <span style={styles.spinner} /> : <>Entrar <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine} /><span style={styles.dividerText}>ou</span><span style={styles.dividerLine} />
          </div>
          <p style={styles.cadastroText}>
            Novo profissional?{" "}
            <Link to="/cadastro-profissional" style={styles.link}>Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" },
  leftPanel: {
    flex: "0 0 42%",
    background: "linear-gradient(145deg, #0a2560 0%, #1448a8 60%, #2563eb 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", overflow: "hidden",
  },
  leftInner: { position: "relative", zIndex: 2, padding: "48px", color: "white" },
  leftTitle: { fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: 700, lineHeight: 1.1, color: "white", marginBottom: "16px" },
  leftSubtitle: { fontSize: "15px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: "32px" },
  tag: {
    display: "inline-flex", alignItems: "center",
    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "20px", padding: "6px 14px", fontSize: "13px", color: "rgba(255,255,255,0.9)", width: "fit-content",
  },
  leftCircle1: { position: "absolute", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: "-80px", right: "-80px" },
  leftCircle2: { position: "absolute", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", top: "40px", right: "40px" },
  rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f6ff", padding: "40px 24px" },
  formCard: { background: "white", borderRadius: "20px", padding: "44px 40px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 32px rgba(37,99,235,0.08)", border: "1px solid #dbeafe" },
  formTitle: { fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#0a2560", marginBottom: "6px" },
  formSubtitle: { fontSize: "14px", color: "#64748b" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#334155", letterSpacing: "0.02em" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "12px", display: "flex", alignItems: "center", pointerEvents: "none" },
  input: { width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid #dbeafe", borderRadius: "10px", fontSize: "14px", color: "#0a2560", background: "#f8fbff", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  erroBox: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#dc2626" },
  btn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg, #1448a8, #2563eb)", color: "white", border: "none", borderRadius: "10px", padding: "13px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: "4px" },
  spinner: { width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 16px" },
  dividerLine: { flex: 1, height: "1px", background: "#e2e8f0" },
  dividerText: { fontSize: "12px", color: "#94a3b8" },
  cadastroText: { textAlign: "center", fontSize: "14px", color: "#64748b" },
  link: { color: "#2563eb", fontWeight: 600, textDecoration: "none" },
};