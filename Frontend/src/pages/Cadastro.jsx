import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", crm: "", senha: "", confirmarSenha: "" });
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErros({ ...erros, [e.target.name]: "" });
  }

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = "Nome completo é obrigatório.";
    if (!form.email.trim()) e.email = "E-mail é obrigatório.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "E-mail inválido.";
    if (!form.crm.trim()) e.crm = "CRM/CRF é obrigatório.";
    if (!form.senha) e.senha = "Senha é obrigatória.";
    else if (form.senha.length < 6) e.senha = "Mínimo de 6 caracteres.";
    if (form.senha !== form.confirmarSenha) e.confirmarSenha = "As senhas não coincidem.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errosValidados = validar();
    if (Object.keys(errosValidados).length > 0) { setErros(errosValidados); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSucesso(true); setTimeout(() => navigate("/home"), 1800); }, 1000);
  }

  if (sucesso) {
    return (
      <div style={{ ...styles.wrapper, alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fillBar { from { width: 0 } to { width: 100% } }`}</style>
        <div style={styles.sucessoCard}>
          <div style={styles.sucessoIconWrap}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2 style={styles.sucessoTitle}>Cadastro realizado!</h2>
          <p style={styles.sucessoText}>Bem-vindo(a), <strong>{form.nome.split(" ")[0]}</strong>.<br />Redirecionando para o painel...</p>
          <div style={styles.progressBar}><div style={styles.progressFill} /></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarInner}>
          <Link to="/" style={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Voltar ao login
          </Link>
          <span style={styles.topBarTitle}>Síndrome X Frágil</span>
        </div>
      </div>

      <div style={styles.body}>
        {/* Info lateral */}
        <div style={styles.infoPanel}>
          <h1 style={styles.infoTitle}>Cadastro de<br /><span style={{ color: "#2563eb" }}>Profissional de Saúde</span></h1>
          <p style={styles.infoText}>Preencha seus dados para acessar o sistema de gerenciamento clínico.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[{ n: "01", label: "Preencha seus dados" }, { n: "02", label: "Confirme sua senha" }, { n: "03", label: "Acesse o painel" }].map(s => (
              <div key={s.n} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={styles.stepNum}>{s.n}</span>
                <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Criar conta</h2>
          <p style={styles.formSubtitle}>Todos os campos são obrigatórios</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }} noValidate>
            <Field label="Nome completo" name="nome" type="text" placeholder="Dr(a). João Silva" value={form.nome} onChange={handleChange} erro={erros.nome} />
            <Field label="E-mail profissional" name="email" type="email" placeholder="seuemail@hospital.com" value={form.email} onChange={handleChange} erro={erros.email} />
            <Field label="CRM / CRF" name="crm" type="text" placeholder="CRM-SP 123456 ou CRF-RJ 98765" value={form.crm} onChange={handleChange} erro={erros.crm} />
            <div style={{ display: "flex", gap: "16px" }}>
              <Field label="Senha" name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleChange} erro={erros.senha} />
              <Field label="Confirmar senha" name="confirmarSenha" type="password" placeholder="••••••••" value={form.confirmarSenha} onChange={handleChange} erro={erros.confirmarSenha} />
            </div>
            <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.75 : 1 }}>
              {loading ? <span style={styles.spinner} /> : <>Cadastrar profissional <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b", marginTop: "20px" }}>
            Já tem conta? <Link to="/" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type, placeholder, value, onChange, erro }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>{label}</label>
      <input
        style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${erro ? "#fca5a5" : "#dbeafe"}`, borderRadius: "10px", fontSize: "14px", color: "#0a2560", background: erro ? "#fff8f8" : "#f8fbff", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
        type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} autoComplete="off"
      />
      {erro && <span style={{ fontSize: "12px", color: "#dc2626" }}>{erro}</span>}
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", background: "#f0f6ff", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" },
  topBar: { background: "linear-gradient(135deg, #0a2560, #2563eb)", padding: "0 40px" },
  topBarInner: { maxWidth: "1100px", margin: "0 auto", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  backLink: { display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "14px", fontWeight: 500 },
  topBarTitle: { color: "white", fontWeight: 600, fontSize: "15px" },
  body: { flex: 1, display: "flex", maxWidth: "1100px", margin: "0 auto", width: "100%", padding: "48px 40px", gap: "56px", alignItems: "flex-start" },
  infoPanel: { flex: "0 0 300px", paddingTop: "8px" },
  infoTitle: { fontFamily: "'Playfair Display', serif", fontSize: "34px", fontWeight: 700, color: "#0a2560", lineHeight: 1.15, marginBottom: "18px" },
  infoText: { fontSize: "15px", color: "#64748b", lineHeight: 1.65, marginBottom: "36px" },
  stepNum: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #1448a8, #2563eb)", color: "white", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  formCard: { flex: 1, background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 4px 32px rgba(37,99,235,0.08)", border: "1px solid #dbeafe" },
  formTitle: { fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#0a2560", marginBottom: "4px" },
  formSubtitle: { fontSize: "14px", color: "#64748b", marginBottom: "28px" },
  btn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg, #1448a8, #2563eb)", color: "white", border: "none", borderRadius: "10px", padding: "13px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: "8px" },
  spinner: { width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
  sucessoCard: { background: "white", borderRadius: "20px", padding: "56px 48px", textAlign: "center", maxWidth: "380px", boxShadow: "0 4px 32px rgba(37,99,235,0.1)", border: "1px solid #dbeafe" },
  sucessoIconWrap: { width: "72px", height: "72px", borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  sucessoTitle: { fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#0a2560", marginBottom: "10px" },
  sucessoText: { fontSize: "15px", color: "#64748b", lineHeight: 1.6, marginBottom: "28px" },
  progressBar: { height: "4px", background: "#dbeafe", borderRadius: "4px", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(135deg, #1448a8, #2563eb)", borderRadius: "4px", animation: "fillBar 1.8s ease forwards" },
};