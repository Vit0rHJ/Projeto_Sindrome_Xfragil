import { useState, useEffect } from "react";
import api from "../services/api";
import Avatar from "../components/Avatar";

const s = {
  wrap: { display: "flex", height: "calc(100vh - 62px)", overflow: "hidden" },
  left: {
    flex: 1,
    background: "#fff",
    padding: "28px 32px",
    overflow: "auto",
    borderRight: "3px solid #0a0a0a",
    position: "relative",
  },
  right: {
    width: 320,
    flexShrink: 0,
    background: "#0a0a0a",
    padding: "24px 22px",
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
    fontSize: 38,
    letterSpacing: 2,
    color: "#0a0a0a",
    lineHeight: 1,
    marginBottom: 4,
  },
  sub: { fontSize: 10, color: "#999", letterSpacing: 1, marginBottom: 24 },
  tbl: { width: "100%", borderCollapse: "collapse" },
  th: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#ccc",
    textTransform: "uppercase",
    textAlign: "left",
    padding: "6px 10px",
    borderBottom: "1px solid #e8e8e8",
    background: "#fafafa",
  },
  td: {
    fontSize: 11,
    color: "#555",
    padding: "9px 10px",
    borderBottom: "1px solid #f0f0f0",
  },
  av: { display: "flex", alignItems: "center", gap: 8 },
  avc: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "#0d1a33",
    border: "1px solid #1a6fff22",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 9,
    fontWeight: 700,
    color: "#1a6fff",
    flexShrink: 0,
  },
  bp: {
    display: "inline-block",
    fontSize: 8,
    letterSpacing: 1,
    padding: "2px 8px",
    color: "#e8a020",
    border: "1px solid #e8a020",
  },
  btnDir: {
    fontSize: 8,
    letterSpacing: 1,
    padding: "4px 10px",
    border: "1px solid #1a6fff",
    color: "#1a6fff",
    background: "#fff",
    cursor: "pointer",
    textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  reye: {
    fontSize: 8,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: "#1a6fff",
    marginBottom: 6,
  },
  rtitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    letterSpacing: 2,
    color: "#fff",
    marginBottom: 16,
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
    marginBottom: 8,
  },
  modalSub: { fontSize: 12, color: "#888", marginBottom: 20 },
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
  label: {
    display: "block",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 6,
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    fontSize: 12,
    color: "#0a0a0a",
    background: "#fafafa",
    outline: "none",
    marginBottom: 16,
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
  },
  btnBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "#1a6fff",
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
  statCard: {
    border: "1px solid #1a1a1a",
    padding: "14px 16px",
    marginBottom: 12,
    position: "relative",
  },
  statBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "#1a6fff",
  },
  statVal: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    color: "#1a6fff",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#446",
    textTransform: "uppercase",
    marginTop: 2,
  },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function Secretaria() {
  const [prechecklist, setPrechecklist] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [medicoId, setMedicoId] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    Promise.all([
      // busca os pre checklits e os medicos ao mesmo tempo, pra deixar o carregamento mais rapido
      api.get("/secretaria"),
      api.get("/usuarios"),
    ])
      .then(([r1, r2]) => {
        setPrechecklist(r1.data);
        setMedicos(r2.data);
      })
      .finally(() => setLoading(false));
  }, []);
  // o handleDirecionar, envia o consulta_id e o medico_id para o backend e atualiza a lista automaticamente sem precisar recarregar a pagina
  async function handleDirecionar() {
    if (!medicoId) {
      setErro("Selecione um médico.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      await api.post("/secretaria/direcionar", {
        consulta_id: selecionado.consulta_id,
        medico_id: Number(medicoId),
      });
      setMsg(`Paciente direcionado com sucesso.`);
      setSelecionado(null);
      setMedicoId("");
      const { data } = await api.get("/secretaria");
      setPrechecklist(data);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao direcionar.");
    } finally {
      setSalvando(false);
    }
  }
  //separa os checklists em pendentes e em ja direcionados para as estatisticas do painel direito
  const semMedico = prechecklist.filter((c) => !c.medico_id);
  const comMedico = prechecklist.filter((c) => c.medico_id);

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <div style={s.corner}></div>
        <div style={s.eye}>painel da secretaria</div>
        <div style={s.title}>Pré-Checklists</div>
        <div style={s.sub}>
          Checklists preenchidos pelos responsáveis aguardando direcionamento
        </div>

        {msg && <div style={s.success}>{msg}</div>}

        {loading ? (
          <div style={{ fontSize: 12, color: "#aaa" }}>Carregando...</div>
        ) : (
          <table style={s.tbl}>
            <thead>
              <tr>
                <th style={s.th}>Paciente</th>
                <th style={s.th}>Cidade</th>
                <th style={s.th}>Data</th>
                <th style={s.th}>Situação</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {prechecklist.length === 0 ? (
                <tr>
                  <td
                    style={{ ...s.td, color: "#bbb", fontStyle: "italic" }}
                    colSpan={5}
                  >
                    Nenhum pré-checklist pendente
                  </td>
                </tr>
              ) : (
                prechecklist.map((c) => (
                  <tr key={c.id}>
                    <td style={s.td}>
                      <div style={s.av}>
                        <Avatar nome={c.paciente_nome} foto={c.paciente_foto} />
                        {c.paciente_nome}
                      </div>
                    </td>
                    <td style={s.td}>
                      {c.cidade} — {c.estado}
                    </td>
                    <td style={s.td}>{formatDate(c.criado_em)}</td>
                    <td style={s.td}>
                      {c.medico_id ? (
                        <span
                          style={{
                            fontSize: 8,
                            color: "#20c850",
                            border: "1px solid #20c850",
                            padding: "2px 8px",
                          }}
                        >
                          Direcionado
                        </span>
                      ) : (
                        <span style={s.bp}>Pendente</span>
                      )}
                    </td>
                    <td style={s.td}>
                      {!c.medico_id && (
                        <button
                          style={s.btnDir}
                          onClick={() => {
                            setSelecionado(c);
                            setErro("");
                            setMsg("");
                          }}
                        >
                          Direcionar →
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={s.right}>
        <div style={s.reye}>resumo</div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22,
            letterSpacing: 2,
            color: "#fff",
            marginBottom: 16,
          }}
        >
          Estatísticas
        </div>

        <div style={s.statCard}>
          <div style={s.statVal}>
            {String(prechecklist.length).padStart(2, "0")}
          </div>
          <div style={s.statLabel}>pré-checklists recebidos</div>
          <div style={s.statBar}></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statVal}>
            {String(semMedico.length).padStart(2, "0")}
          </div>
          <div style={s.statLabel}>aguardando direcionamento</div>
          <div style={s.statBar}></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statVal}>
            {String(comMedico.length).padStart(2, "0")}
          </div>
          <div style={s.statLabel}>já direcionados</div>
          <div style={s.statBar}></div>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #1a1a1a",
          }}
        >
          <div style={s.reye}>médicos disponíveis</div>
          {medicos.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid #141414",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar nome={m.nome} foto={m.foto} size={22} />
                <span style={{ fontSize: 10, color: "#666" }}>{m.nome}</span>
              </div>
              <span style={{ fontSize: 9, color: "#334", letterSpacing: 1 }}>
                {m.especialidade || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selecionado && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <button style={s.modalClose} onClick={() => setSelecionado(null)}>
              ✕
            </button>
            <div style={s.modalTitle}>Direcionar Paciente</div>
            <div style={s.modalSub}>
              Selecione o médico que vai atender{" "}
              <strong>{selecionado.paciente_nome}</strong>
            </div>
            {erro && <div style={s.error}>{erro}</div>}
            <label style={s.label}>Médico responsável</label>
            <select
              style={s.select}
              value={medicoId}
              onChange={(e) => setMedicoId(e.target.value)}
            >
              <option value="">Selecione um médico</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} — {m.especialidade || m.crm}
                </option>
              ))}
            </select>

            <button
              style={s.btn}
              onClick={handleDirecionar}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Confirmar direcionamento"}
              <div style={s.btnBar}></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
