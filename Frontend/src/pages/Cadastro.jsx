import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3001";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function Field({ label, children, required }) {
  return (
    <div style={fieldStyles.group}>
      <label style={fieldStyles.label}>
        {label}
        {required && <span style={{ color: "#e11d48", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const fieldStyles = {
  group: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
};

const inputStyle = {
  padding: "11px 14px",
  border: "1.5px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#1e293b",
  background: "#f8faff",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export function Cadastro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    nome: "", cpf: "", data_nascimento: "", email: "", telefone: "",
    nome_responsavel: "", cpf_responsavel: "", telefone_responsavel: "",
  });

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErro("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      // 1. Cadastrar paciente
      const resPac = await fetch(`${API}/api/pacientes`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const pacData = await resPac.json();
      if (!resPac.ok) throw new Error(pacData.message || "Erro ao cadastrar paciente");

      const paciente_id = pacData.id ?? pacData.paciente?.id;
      if (!paciente_id) throw new Error("ID do paciente não retornado pela API");

      // 2. Criar consulta vinculada ao paciente
      const resConsulta = await fetch(`${API}/api/consultas`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          paciente_id,
          data_consulta: new Date().toISOString().split("T")[0],
        }),
      });
      const consultaData = await resConsulta.json();
      if (!resConsulta.ok) throw new Error(consultaData.message || "Erro ao criar consulta");

      const consulta_id = consultaData.id ?? consultaData.consulta?.id;
      if (!consulta_id) throw new Error("ID da consulta não retornado pela API");

      // 3. Ir direto para o checklist com o consulta_id
      navigate(`/checklist?consulta_id=${consulta_id}`);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h1 style={styles.title}>Novo Cadastro de Paciente</h1>
        <p style={styles.subtitle}>Preencha os dados para registrar um novo paciente e iniciar o checklist</p>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>

          {/* Dados do paciente */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionBlockHeader}>
              <div style={styles.sectionIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2 style={styles.sectionBlockTitle}>Dados do Paciente</h2>
            </div>
            <div style={styles.grid2}>
              <Field label="Nome completo" required>
                <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Nome do paciente" style={inputStyle}/>
              </Field>
              <Field label="CPF" required>
                <input name="cpf" value={form.cpf} onChange={handleChange} required placeholder="000.000.000-00" style={inputStyle}/>
              </Field>
              <Field label="Data de nascimento">
                <input name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} style={inputStyle}/>
              </Field>
              <Field label="Telefone">
                <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" style={inputStyle}/>
              </Field>
              <Field label="E-mail" >
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@exemplo.com" style={inputStyle}/>
              </Field>
            </div>
          </div>

          {/* Dados do responsável */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionBlockHeader}>
              <div style={styles.sectionIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h2 style={styles.sectionBlockTitle}>Dados do Responsável</h2>
            </div>
            <div style={styles.grid2}>
              <Field label="Nome do responsável" required>
                <input name="nome_responsavel" value={form.nome_responsavel} onChange={handleChange} required placeholder="Nome completo do responsável" style={inputStyle}/>
              </Field>
              <Field label="CPF do responsável" required>
                <input name="cpf_responsavel" value={form.cpf_responsavel} onChange={handleChange} required placeholder="000.000.000-00" style={inputStyle}/>
              </Field>
              <Field label="Telefone do responsável" required>
                <input name="telefone_responsavel" value={form.telefone_responsavel} onChange={handleChange} required placeholder="(00) 00000-0000" style={inputStyle}/>
              </Field>
            </div>
          </div>

          {erro && (
            <div style={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {erro}
            </div>
          )}

          <div style={styles.actions}>
            <button type="button" onClick={() => navigate("/home")} style={styles.cancelBtn}>Cancelar</button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Cadastrando..." : "Cadastrar e iniciar Checklist →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:               { display: "flex", flexDirection: "column", gap: "24px", maxWidth: "860px" },
  pageHeader:         {},
  title:              { fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#0a2560", margin: "0 0 6px 0" },
  subtitle:           { fontSize: "14px", color: "#64748b", margin: 0 },
  card:               { background: "white", borderRadius: "16px", border: "1px solid #e8f0fe", overflow: "hidden", boxShadow: "0 2px 12px rgba(20,72,168,0.06)" },
  sectionBlock:       { padding: "28px 32px", borderBottom: "1px solid #f1f5f9" },
  sectionBlockHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
  sectionIcon:        { width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #1448a8, #1e6fd9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sectionBlockTitle:  { fontSize: "15px", fontWeight: 700, color: "#0a2560", margin: 0 },
  grid2:              { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  errorBox:           { display: "flex", alignItems: "center", gap: "8px", margin: "0 32px", padding: "12px 16px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", color: "#e11d48", fontSize: "13px" },
  actions:            { display: "flex", justifyContent: "flex-end", gap: "12px", padding: "24px 32px" },
  cancelBtn:          { padding: "11px 24px", background: "transparent", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  submitBtn:          { padding: "11px 28px", background: "linear-gradient(135deg, #1448a8, #1e6fd9)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 14px rgba(20,72,168,0.25)" },
};
