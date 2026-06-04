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
  const [sucesso, setSucesso] = useState(false);
  const [form, setForm] = useState({
    nome: "", data_nascimento: "", cpf: "", telefone: "",
    email: "", endereco: "", observacoes: "",
  });

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(`${API}/api/pacientes`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao cadastrar paciente");
      setSucesso(true);
      setTimeout(() => {
        navigate("/checklist");
      }, 1200);
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
        <p style={styles.subtitle}>Preencha os dados para registrar um novo paciente no sistema</p>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          {/* Dados pessoais */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionBlockHeader}>
              <div style={styles.sectionIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2 style={styles.sectionBlockTitle}>Dados Pessoais</h2>
            </div>

            <div style={styles.grid2}>
              <Field label="Nome completo" required>
                <input
                  name="nome" value={form.nome} onChange={handleChange}
                  required placeholder="Nome do paciente"
                  style={inputStyle}
                />
              </Field>
              <Field label="Data de nascimento" required>
                <input
                  name="data_nascimento" type="date"
                  value={form.data_nascimento} onChange={handleChange}
                  required style={inputStyle}
                />
              </Field>
              <Field label="CPF">
                <input
                  name="cpf" value={form.cpf} onChange={handleChange}
                  placeholder="000.000.000-00" style={inputStyle}
                />
              </Field>
              <Field label="Telefone">
                <input
                  name="telefone" value={form.telefone} onChange={handleChange}
                  placeholder="(00) 00000-0000" style={inputStyle}
                />
              </Field>
            </div>
          </div>

          {/* Contato */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionBlockHeader}>
              <div style={styles.sectionIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 style={styles.sectionBlockTitle}>Contato e Localização</h2>
            </div>

            <div style={styles.grid2}>
              <Field label="E-mail">
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="email@exemplo.com" style={inputStyle}
                />
              </Field>
              <Field label="Endereço">
                <input
                  name="endereco" value={form.endereco} onChange={handleChange}
                  placeholder="Rua, número, bairro, cidade" style={inputStyle}
                />
              </Field>
            </div>
          </div>

          {/* Observações */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionBlockHeader}>
              <div style={styles.sectionIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h2 style={styles.sectionBlockTitle}>Observações Clínicas</h2>
            </div>

            <Field label="Observações">
              <textarea
                name="observacoes" value={form.observacoes} onChange={handleChange}
                placeholder="Informações adicionais relevantes..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </Field>
          </div>

          {erro && (
            <div style={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {erro}
            </div>
          )}

          {sucesso && (
            <div style={styles.successBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Paciente cadastrado! Redirecionando para o checklist...
            </div>
          )}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate("/home")}
              style={styles.cancelBtn}
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Cadastrando..." : "Cadastrar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "860px",
  },
  pageHeader: {},
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "26px",
    fontWeight: 700,
    color: "#0a2560",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  card: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e8f0fe",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(20,72,168,0.06)",
  },
  sectionBlock: {
    padding: "28px 32px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionBlockHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  sectionIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #1448a8, #1e6fd9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionBlockTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0a2560",
    margin: 0,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 32px",
    padding: "12px 16px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "10px",
    color: "#e11d48",
    fontSize: "13px",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 32px",
    padding: "12px 16px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    color: "#16a34a",
    fontSize: "13px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "24px 32px",
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
