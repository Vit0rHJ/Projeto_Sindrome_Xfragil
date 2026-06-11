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
  medNome: { fontSize: 13, fontWeight: 600, color: "#0a0a0a" },
  medInfo: { fontSize: 10, color: "#aaa", marginTop: 2 },
  cardBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "#e8e8e8",
  },
  actions: { display: "flex", gap: 8 },
  btnEdit: {
    fontSize: 9,
    letterSpacing: 1,
    padding: "4px 12px",
    border: "1px solid #0a0a0a",
    color: "#0a0a0a",
    background: "#fff",
    cursor: "pointer",
    textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif",
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
  // o overlay é um fundo escuro atras  do modal, cobrindo a tela
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

export default function AdminMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    crm: "",
    especialidade: "medico",
  });
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null); // aguarda o medico que esta sendo editado, quando clicarmos em editar, vai abrir o modal preenchido com os dados dele
  const [desativando, setDesativando] = useState(null); // aguarda o medico que vai ser desativado, o modal vai pedir para selecionar o medico que vai assumir os pacientes
  const [novoMedicoId, setNovoMedicoId] = useState("");

  useEffect(() => {
    carregarMedicos();
  }, []);

  async function carregarMedicos() {
    const { data } = await api.get("/usuarios");
    setMedicos(data);
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
      await api.post("/usuarios", form);
      setMsg("Médico cadastrado com sucesso.");
      setForm({ nome: "", email: "", senha: "", crm: "", especialidade: "" });
      carregarMedicos();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar(e) {
    e.preventDefault();
    setErro("");
    setMsg("");
    setLoading(true);
    try {
      await api.put(`/usuarios/${editando.id}`, {
        nome: editando.nome,
        crm: editando.crm,
        especialidade: editando.especialidade,
      });
      setMsg("Médico atualizado.");
      setEditando(null);
      carregarMedicos();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao editar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDesativar() {
    if (!novoMedicoId) {
      setErro("Selecione o médico que vai assumir os pacientes.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      await api.patch(`/usuarios/${desativando.id}/desativar`, {
        novo_medico_id: Number(novoMedicoId),
      });
      setMsg("Médico desativado e pacientes transferidos.");
      setDesativando(null);
      setNovoMedicoId("");
      carregarMedicos();
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
        <div style={s.title}>Cadastrar Médico</div>

        {msg && <div style={s.success}>{msg}</div>}
        {erro && <div style={s.error}>{erro}</div>}

        <form onSubmit={handleCadastrar}>
          <label style={s.label}>Nome completo *</label>
          <input
            style={s.input}
            name="nome"
            placeholder="Dr(a). Nome Sobrenome"
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
          <label style={s.label}>CRM *</label>
          <input
            style={s.input}
            name="crm"
            placeholder="CRM/UF 000000"
            value={form.crm}
            onChange={handleChange}
            required
          />
          <label style={s.label}>Especialidade</label>
          <input
            style={s.input}
            name="especialidade"
            placeholder="Ex: Neuropediatria"
            value={form.especialidade}
            onChange={handleChange}
          />
          <label style={s.label}>Perfil</label>
          <select
            style={{ ...s.input, marginBottom: 14 }}
            name="perfil"
            value={form.perfil}
            onChange={handleChange}
          >
            <option value="medico">Médico</option>
            <option value="secretaria">Secretaria</option>
          </select>

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar Médico"}
            <div style={s.btnBar}></div>
          </button>
        </form>
      </div>

      <div style={s.right}>
        <div style={s.eye}>lista de médicos</div>
        <div style={s.rtitle}>Médicos Ativos ({medicos.length})</div>

        {medicos.map((m) => (
          <div key={m.id} style={s.card}>
            <div style={s.cardTop}>
              <div style={s.avc}>{m.nome?.[0]?.toUpperCase()}</div>
              <div>
                <div style={s.medNome}>{m.nome}</div>
                <div style={s.medInfo}>
                  {m.crm} · {m.especialidade} · {m.email}
                </div>
              </div>
            </div>
            <div style={s.actions}>
              <button style={s.btnEdit} onClick={() => setEditando({ ...m })}>
                Editar
              </button>
              <button
                style={s.btnDeact}
                onClick={() => {
                  setDesativando(m);
                  setErro("");
                }}
              >
                Desativar
              </button>
            </div>
            <div style={s.cardBar}></div>
          </div>
        ))}
      </div>

      {editando && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <button style={s.modalClose} onClick={() => setEditando(null)}>
              ✕
            </button>
            <div style={s.modalTitle}>Editar Médico</div>
            <form onSubmit={handleEditar}>
              <label style={s.label}>Nome</label>
              <input
                style={s.input}
                value={editando.nome}
                onChange={(e) =>
                  setEditando({ ...editando, nome: e.target.value })
                }
              />
              <label style={s.label}>CRM</label>
              <input
                style={s.input}
                value={editando.crm}
                onChange={(e) =>
                  setEditando({ ...editando, crm: e.target.value })
                }
              />
              <label style={s.label}>Especialidade</label>
              <input
                style={s.input}
                value={editando.especialidade}
                onChange={(e) =>
                  setEditando({ ...editando, especialidade: e.target.value })
                }
              />
              <button style={s.btn} type="submit" disabled={loading}>
                Salvar alterações<div style={s.btnBar}></div>
              </button>
            </form>
          </div>
        </div>
      )}

      {desativando && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <button style={s.modalClose} onClick={() => setDesativando(null)}>
              ✕
            </button>
            <div style={s.modalTitle}>Desativar Médico</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
              Os pacientes de <strong>{desativando.nome}</strong> serão
              transferidos para o médico selecionado.
            </div>
            {erro && <div style={s.error}>{erro}</div>}
            <label style={s.label}>Médico que vai assumir</label>
            <select
              style={s.input}
              value={novoMedicoId}
              onChange={(e) => setNovoMedicoId(e.target.value)}
            >
              <option value="">Selecione um médico</option>
              {medicos
                .filter((m) => m.id !== desativando.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} — {m.crm}
                  </option>
                ))}
            </select>
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
