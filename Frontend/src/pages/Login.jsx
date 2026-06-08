import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Credenciais inválidas");
      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.brandArea}>
          <div style={styles.logoMark}>
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
              <path d="M20 12 Q32 24 44 12" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M20 28 Q32 40 44 28" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M20 44 Q32 56 44 44" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <line x1="20" y1="12" x2="20" y2="44" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
              <line x1="44" y1="12" x2="44" y2="44" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
            </svg>
          </div>
          <h1 style={styles.brandName}>X Frágil</h1>
          <p style={styles.brandTagline}>Sistema de Gestão Clínica</p>
        </div>

        <div style={styles.infoBox}>
          <div style={styles.infoItem}>
            <div style={styles.infoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <span>Checklist de sintomas inteligente</span>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            </div>
            <span>Laudos clínicos automatizados</span>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span>Gestão de pacientes centralizada</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Bem-vindo de volta</h2>
            <p style={styles.formSubtitle}>Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>E-mail</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Senha</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {erro && <div style={styles.errorBox}>{erro}</div>}

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
  },
  leftPanel: {
    width: "420px",
    flexShrink: 0,
    background: "linear-gradient(160deg, #0a2560 0%, #1448a8 60%, #1e6fd9 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "60px 48px",
    position: "relative",
    overflow: "hidden",
  },
  brandArea: {
    marginBottom: "48px",
  },
  logoMark: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  brandName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "32px",
    fontWeight: 700,
    color: "white",
    margin: "0 0 8px 0",
  },
  brandTagline: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
  },
  infoBox: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    color: "rgba(255,255,255,0.85)",
    fontSize: "14px",
  },
  infoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "white",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8faff",
    padding: "40px",
  },
  formCard: {
    background: "white",
    borderRadius: "20px",
    padding: "48px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 40px rgba(20,72,168,0.08)",
    border: "1px solid #e8f0fe",
  },
  formHeader: {
    marginBottom: "32px",
  },
  formTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "26px",
    fontWeight: 700,
    color: "#0a2560",
    margin: "0 0 8px 0",
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    letterSpacing: "0.02em",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#1e293b",
    background: "#f8faff",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  },
  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#e11d48",
  },
  submitBtn: {
    padding: "13px",
    background: "linear-gradient(135deg, #1448a8, #1e6fd9)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "4px",
    transition: "opacity 0.2s",
  },
};
