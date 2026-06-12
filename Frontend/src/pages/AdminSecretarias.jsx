import { useState, useEffect } from "react";
import api from "../services/api";

const s = {
  wrap: { display: "flex", height: "calc(100vh - 62px)", overflow: "hidden" },
  left: {
    width: "40%",
    background: "#fff",
    padding: "28px 28px",
    overflow: "auto",
    borderRight: "3px solid #0a0a0a",
    position: "relative",
  },
  right: {
    flex: 1,
    background: "#fff",
    padding: "28px 28px",
    overflow: "auto",
  },
  corner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderWidth: "0 26px 26px 0",
    borderColor: "transparent #1a6fff transparent transparent",
  },
  eye: {
    fontSize: 8,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: "#1a6fff",
    marginBottom: 5,
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    letterSpacing: 2,
    color: "#0a0a0a",
    lineHeight: 1,
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    fontSize: 12,
    color: "#0a0a0a",
    background: "#fafafa",
    outline: "none",
    marginBottom: 14,
  },
  btn: {
    width: "100%",
    padding: 11,
    background: "#0a0a0a",
    color: "#fff",
    border: "none",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Space Grotesk', sans-serif",
    position: "relative",
    marginTop: 4,
  },
  btnBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "#1a6fff",
  },
  rtitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    letterSpacing: 2,
    color: "#0a0a0a",
    marginBottom: 16,
  },
  card: {
    border: "1px solid #e8e8e8",
    padding: "14px 16px",
    marginBottom: 10,
    position: "relative",
  },
  cardTop: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
  avc: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#0d1a33",
    border: "1px solid #1a6fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#1a6fff",
    flexShrink: 0,
  },
  secNome: { fontSize: 13, fontWeight: 600, color: "#0a0a0a" },
  secInfo: { fontSize: 10, color: "#aaa", marginTop: 2 },
  cardBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "#e8e8e8",
  },
  btnDeact: {
    fontSize: 9,
    letterSpacing: 1,
    padding: "4px 12px",
    border: "1px solid #e8a020",
    color: "#e8a020",
    background: "#fff",
    cursor: "pointer",
    textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  success: {
    background: "#f0fff4",
    border: "1px solid #ccffcc",
    color: "#006600",
    fontSize: 11,
    padding: "8px 12px",
    marginBottom: 12,
  },
  error: {
    background: "#fff0f0",
    border: "1px solid #ffcccc",
    color: "#cc0000",
    fontSize: 11,
    padding: "8px 12px",
    marginBottom: 12,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: { background: "#fff", padding: 28, width: 380, position: "relative" },
  modalTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 16,
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 16,
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#aaa",
  },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function AdminSecretarias() {
  const [secretarias, setSecretarias] = useState([]);
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [desativando, setDesativando] = useState(null);

  useEffect(() => {
    carregarSecretarias();
  }, []);

  async function carregarSecretarias() {
    const { data } = await api.get("/usuarios/secretarias");
    setSecretarias(data);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCadastrar(e) {
    e.preventDefault();
    setErro("");
    setMsg("");
    setLoading(true);
    try {
      await api.post("/usuarios/secretaria", form);
      setMsg("Secretária cadastrada com sucesso.");
      setForm({ nome: "", email: "", senha: "" });
      carregarSecretarias();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDesativar() {
    setErro("");
    setLoading(true);
    try {
      await api.patch(`/usuarios/${desativando.id}/desativar-secretaria`);
      setMsg("Secretária desativada com sucesso.");
      setDesativando(null);
      carregarSecretarias();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao desativar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <div style={s.corner}></div>
        <div style={s.eye}>administração</div>
        <div style={s.title}>Cadastrar Secretária</div>

        {msg && <div style={s.success}>{msg}</div>}
        {erro && !desativando && <div style={s.error}>{erro}</div>}

        <form onSubmit={handleCadastrar}>
          <label style={s.label}>Nome completo *</label>
          <input
            style={s.input}
            name="nome"
            placeholder="Nome Sobrenome"
            value={form.nome}
            onChange={handleChange}
            required
          />
          <label style={s.label}>E-mail *</label>
          <input
            style={s.input}
            name="email"
            type="email"
            placeholder="email@clinica.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label style={s.label}>Senha *</label>
          <input
            style={s.input}
            name="senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={form.senha}
            onChange={handleChange}
            required
          />

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar Secretária"}
            <div style={s.btnBar}></div>
          </button>
        </form>
      </div>

      <div style={s.right}>
        <div style={s.eye}>equipe administrativa</div>
        <div style={s.rtitle}>Secretárias Ativas ({secretarias.length})</div>

        {secretarias.length === 0 ? (
          <div style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>
            Nenhuma secretária cadastrada
          </div>
        ) : (
          secretarias.map((sec) => (
            <div key={sec.id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.avc}>{sec.nome?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={s.secNome}>{sec.nome}</div>
                  <div style={s.secInfo}>
                    {sec.email} · desde {formatDate(sec.criado_em)}
                  </div>
                </div>
              </div>
              <button
                style={s.btnDeact}
                onClick={() => {
                  setDesativando(sec);
                  setErro("");
                  setMsg("");
                }}
              >
                Desativar
              </button>
              <div style={s.cardBar}></div>
            </div>
          ))
        )}
      </div>

      {desativando && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <button style={s.modalClose} onClick={() => setDesativando(null)}>
              ✕
            </button>
            <div style={s.modalTitle}>Desativar Secretária</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
              <strong>{desativando.nome}</strong> perderá o acesso ao sistema.
              O registro é mantido para fins de auditoria.
            </div>
            {erro && <div style={s.error}>{erro}</div>}
            <button
              style={{ ...s.btn, background: "#e8a020" }}
              onClick={handleDesativar}
              disabled={loading}
            >
              Confirmar desativação
              <div style={{ ...s.btnBar, background: "#cc8800" }}></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
