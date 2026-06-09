import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3001";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const inputStyle = {
  padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px",
  fontSize: "14px", color: "#1e293b", background: "#f8faff",
  fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%", boxSizing: "border-box",
};

export function AdminMedicos() {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [form, setForm] = useState({ nome: "", email: "", senha: "", crm: "", especialidade: "" });

  function loadMedicos() {
    fetch(`${API}/api/usuarios`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setMedicos(Array.isArray(data) ? data : data.usuarios || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadMedicos(); }, []);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErro(""); setSucesso("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha || !form.crm) {
      setErro("Preencha todos os campos obrigatórios."); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/usuarios`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ ...form, perfil: "medico" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao cadastrar médico");
      setSucesso(`Médico "${form.nome}" cadastrado com sucesso!`);
      setForm({ nome: "", email: "", senha: "", crm: "", especialidade: "" });
      loadMedicos();
    } catch (err) { setErro(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gerenciar Médicos</h1>
          <p style={styles.subtitle}>Cadastre novos profissionais e visualize os médicos ativos</p>
        </div>
        <button onClick={() => navigate("/home")} style={styles.backBtn}>← Voltar</button>
      </div>

      <div style={styles.cols}>
        {/* Formulário */}
        <div>
          <h2 style={styles.colTitle}>Cadastrar Novo Médico</h2>
          <form onSubmit={handleSubmit} style={styles.formCard}>
            {[
              { name: "nome",          label: "Nome completo",  placeholder: "Dr(a). Nome Sobrenome", required: true },
              { name: "email",         label: "E-mail",          placeholder: "email@clinica.com",     required: true, type: "email" },
              { name: "senha",         label: "Senha",           placeholder: "Mínimo 8 caracteres",  required: true, type: "password" },
              { name: "crm",           label: "CRM",             placeholder: "CRM/UF 000000",         required: true },
              { name: "especialidade", label: "Especialidade",   placeholder: "Ex: Neuropediatria" },
            ].map(f => (
              <div key={f.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                  {f.label}{f.required && <span style={{ color: "#e11d48" }}> *</span>}
                </label>
                <input
                  type={f.type || "text"} name={f.name} value={form[f.name]}
                  onChange={handleChange} placeholder={f.placeholder}
                  style={inputStyle} autoComplete={f.type === "password" ? "new-password" : undefined}
                />
              </div>
            ))}
            {erro   && <div style={styles.erroBox}>{erro}</div>}
            {sucesso && <div style={styles.sucessoBox}>✓ {sucesso}</div>}
            <button type="submit" disabled={saving} style={styles.submitBtn}>
              {saving ? "Cadastrando..." : "Cadastrar Médico"}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div>
          <h2 style={styles.colTitle}>Médicos Cadastrados ({medicos.length})</h2>
          <div style={styles.listCard}>
            {loading && <p style={styles.msg}>Carregando...</p>}
            {!loading && medicos.length === 0 && <p style={styles.msg}>Nenhum médico cadastrado ainda.</p>}
            {medicos.map(m => (
              <div key={m.id} style={styles.medicoRow}>
                <div style={styles.avatar}>{(m.nome || "M").charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0a2560" }}>{m.nome}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    {m.crm && <span style={{ fontWeight: 700, color: "#1448a8", marginRight: "8px" }}>{m.crm}</span>}
                    {m.especialidade}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{m.email}</div>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, flexShrink: 0,
                  background: m.perfil === "admin" ? "#061a4a" : "#dbeafe",
                  color:      m.perfil === "admin" ? "white"   : "#1448a8",
                }}>
                  {m.perfil === "admin" ? "Admin" : "Médico"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:       { display: "flex", flexDirection: "column", gap: "24px" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  title:      { fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#0a2560", margin: "0 0 6px 0" },
  subtitle:   { fontSize: "14px", color: "#64748b", margin: 0 },
  backBtn:    { padding: "9px 16px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#475569", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  cols:       { display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px", alignItems: "start" },
  colTitle:   { fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#0a2560", marginBottom: "12px" },
  formCard:   { background: "white", borderRadius: "16px", border: "1px solid #e8f0fe", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 2px 12px rgba(20,72,168,0.06)" },
  erroBox:    { padding: "10px 14px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", fontSize: "13px", color: "#e11d48" },
  sucessoBox: { padding: "10px 14px", background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: "8px", fontSize: "13px", color: "#1448a8", fontWeight: 600 },
  submitBtn:  { height: "46px", background: "linear-gradient(135deg, #1448a8, #1e6fd9)", border: "none", borderRadius: "9px", color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  listCard:   { background: "white", borderRadius: "16px", border: "1px solid #e8f0fe", overflow: "hidden", boxShadow: "0 2px 12px rgba(20,72,168,0.06)" },
  msg:        { padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "14px" },
  medicoRow:  { display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderBottom: "1px solid #f1f5f9" },
  avatar:     { width: "40px", height: "40px", borderRadius: "50%", background: "#dbeafe", color: "#1448a8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, flexShrink: 0 },
};
