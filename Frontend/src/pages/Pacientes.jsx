import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { getUser, UPLOADS_URL } from "../services/api";
import { maskCpf, maskTelefone, validarCpf, validarTelefone } from "../utils/formatos";

const s = {
  wrap: { padding: "28px 32px", overflow: "auto", height: "calc(100vh - 62px)", background: "#fff" },
  eye: { fontSize: 8, letterSpacing: 4, textTransform: "uppercase", color: "#1a6fff", marginBottom: 5 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 2, color: "#0a0a0a", lineHeight: 1, marginBottom: 4 },
  sub: { fontSize: 10, color: "#999", letterSpacing: 1, marginBottom: 24 },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, gap: 16 },
  searchWrap: { position: "relative", width: 320 },
  search: {
    width: "100%", padding: "10px 14px 10px 34px", border: "1px solid #e0e0e0",
    fontSize: 12, color: "#0a0a0a", background: "#fafafa", outline: "none",
  },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#aaa", pointerEvents: "none" },
  count: { fontSize: 10, color: "#aaa", letterSpacing: 1, textTransform: "uppercase" },
  btnNovo: {
    fontSize: 9, letterSpacing: 2, padding: "10px 18px", border: "none", color: "#fff",
    background: "#0a0a0a", cursor: "pointer", textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif", position: "relative", flexShrink: 0,
  },
  btnBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#1a6fff" },
  tbl: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: 8, letterSpacing: 2, color: "#ccc", textTransform: "uppercase", textAlign: "left", padding: "6px 10px", borderBottom: "1px solid #e8e8e8", background: "#fafafa" },
  td: { fontSize: 11, color: "#555", padding: "9px 10px", borderBottom: "1px solid #f0f0f0" },
  av: { display: "flex", alignItems: "center", gap: 8 },
  avc: {
    width: 26, height: 26, borderRadius: "50%", background: "#0d1a33", border: "1px solid #1a6fff22",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: 700, color: "#1a6fff", flexShrink: 0,
  },
  idade: { fontSize: 9, color: "#aaa", marginLeft: 6 },
  acao: { color: "#1a6fff", cursor: "pointer", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" },
  // modal de edicao
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modal: { background: "#fff", padding: 28, width: 620, maxWidth: "100%", maxHeight: "90vh", overflow: "auto", position: "relative" },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, marginBottom: 4 },
  modalSub: { fontSize: 10, color: "#999", letterSpacing: 1, marginBottom: 18 },
  modalClose: { position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#aaa" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" },
  field: { marginBottom: 14 },
  label: { display: "block", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 5 },
  input: { width: "100%", padding: "9px 11px", border: "1px solid #e0e0e0", fontSize: 12, color: "#0a0a0a", background: "#fafafa", outline: "none" },
  secTitle: { gridColumn: "1 / -1", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#0a0a0a", margin: "8px 0 12px", paddingBottom: 6, borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", gap: 8 },
  secDot: { width: 6, height: 6, borderRadius: "50%", background: "#1a6fff" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  btnCancel: { fontSize: 9, letterSpacing: 2, padding: "9px 16px", border: "1px solid #e0e0e0", color: "#888", background: "#fff", cursor: "pointer", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" },
  btnSave: { fontSize: 9, letterSpacing: 2, padding: "9px 20px", border: "none", color: "#fff", background: "#0a0a0a", cursor: "pointer", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif", position: "relative" },
  erroBox: { gridColumn: "1 / -1", background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", fontSize: 11, padding: "8px 12px", marginBottom: 8 },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade >= 0 ? idade : null;
}

export default function Pacientes() {
  const navigate = useNavigate();
  const user = getUser();
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);
  const [fotoPacienteId, setFotoPacienteId] = useState(null);
  const [editando, setEditando] = useState(null); // paciente completo em edicao
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  // abre o modal de edicao buscando os dados completos do paciente
  async function abrirEdicao(id) {
    setErroEdicao("");
    try {
      const { data } = await api.get(`/pacientes/${id}`);
      // normaliza a data para o formato do input type=date (aaaa-mm-dd)
      const dn = data.data_nascimento ? String(data.data_nascimento).slice(0, 10) : "";
      setEditando({ ...data, data_nascimento: dn });
    } catch (err) {
      alert(err.response?.data?.mensagem || "Erro ao abrir o paciente.");
    }
  }

  function alterarCampo(campo, valor) {
    let v = valor;
    if (campo === "cpf_responsavel") v = maskCpf(valor);
    if (["telefone", "telefone_responsavel", "whatsapp", "telefone2"].includes(campo)) v = maskTelefone(valor);
    setEditando((prev) => ({ ...prev, [campo]: v }));
  }

  async function salvarEdicao() {
    setErroEdicao("");
    if (!editando.nome?.trim()) {
      setErroEdicao("O nome do paciente é obrigatório.");
      return;
    }
    if (!validarCpf(editando.cpf_responsavel || "")) {
      setErroEdicao("CPF do responsável inválido. Use 000.000.000-00.");
      return;
    }
    if (!validarTelefone(editando.telefone_responsavel || "")) {
      setErroEdicao("Telefone do responsável inválido. Use +55 (DD) 9XXXX-XXXX.");
      return;
    }
    if (editando.telefone && !validarTelefone(editando.telefone)) {
      setErroEdicao("Telefone do paciente inválido. Use +55 (DD) 9XXXX-XXXX.");
      return;
    }
    setSalvandoEdicao(true);
    try {
      await api.put(`/pacientes/${editando.id}`, editando);
      setEditando(null);
      carregar();
    } catch (err) {
      setErroEdicao(err.response?.data?.mensagem || "Erro ao salvar.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function carregar() {
    api
      .get("/pacientes")
      .then((r) => setPacientes(r.data))
      .finally(() => setLoading(false));
  }

  // abre o seletor de arquivo ja sabendo de qual paciente é a foto
  function escolherFoto(id) {
    setFotoPacienteId(id);
    fileRef.current.click();
  }

  async function enviarFoto(e) {
    const arquivo = e.target.files[0];
    if (!arquivo || !fotoPacienteId) return;
    const fd = new FormData();
    fd.append("foto", arquivo);
    try {
      await api.patch(`/pacientes/${fotoPacienteId}/foto`, fd);
      carregar();
    } catch (err) {
      alert(err.response?.data?.mensagem || "Erro ao enviar foto.");
    } finally {
      e.target.value = "";
      setFotoPacienteId(null);
    }
  }

  const podeVerLaudo = user?.perfil !== "responsavel";

  // clicar no paciente abre a situacao dele: o laudo da avaliacao mais
  // recente (ou a consulta mais recente, se ainda nao houver avaliacao)
  async function abrirSituacao(p) {
    if (!podeVerLaudo) return;
    try {
      const { data } = await api.get("/consultas");
      const doPaciente = data.filter((c) => c.paciente_id === p.id);
      if (doPaciente.length === 0) {
        alert("Este paciente ainda não possui consultas registradas.");
        return;
      }
      const avaliadas = doPaciente.filter((c) => c.encaminhamento);
      const alvo = (avaliadas.length > 0 ? avaliadas : doPaciente).sort(
        (a, b) => b.id - a.id,
      )[0];
      navigate(`/laudo/${alvo.id}`);
    } catch {
      alert("Erro ao buscar as consultas do paciente.");
    }
  }

  // filtro instantâneo por nome ou cpf, sem precisar de nova requisição
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pacientes;
    const termoNumeros = termo.replace(/\D/g, "");
    return pacientes.filter((p) => {
      const nomeBate = p.nome?.toLowerCase().includes(termo);
      const cpfBate =
        termoNumeros.length > 0 &&
        p.cpf?.replace(/\D/g, "").includes(termoNumeros);
      return nomeBate || cpfBate;
    });
  }, [pacientes, busca]);

  const podeCadastrar = ["admin", "medico", "responsavel"].includes(user?.perfil);

  return (
    <div style={s.wrap}>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={enviarFoto}
      />
      <div style={s.eye}>gestão de pacientes</div>
      <div style={s.title}>Pacientes</div>
      <div style={s.sub}>
        {user?.perfil === "medico"
          ? "Pacientes sob seus cuidados"
          : user?.perfil === "responsavel"
            ? "Pacientes cadastrados por você"
            : "Todos os pacientes cadastrados no sistema"}
      </div>

      <div style={s.topRow}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>⌕</span>
          <input
            style={s.search}
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={s.count}>
            {loading ? "..." : `${filtrados.length} paciente${filtrados.length === 1 ? "" : "s"}`}
          </span>
          {podeCadastrar && (
            <button style={s.btnNovo} onClick={() => navigate("/cadastro")}>
              + Novo Paciente
              <div style={s.btnBar}></div>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: "#aaa" }}>Carregando pacientes...</div>
      ) : (
        <table style={s.tbl}>
          <thead>
            <tr>
              <th style={s.th}>Paciente</th>
              <th style={s.th}>CPF</th>
              <th style={s.th}>Nascimento</th>
              <th style={s.th}>Cidade / UF</th>
              <th style={s.th}>Telefone</th>
              <th style={s.th}>E-mail</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td style={{ ...s.td, color: "#bbb", fontStyle: "italic" }} colSpan={7}>
                  {busca
                    ? `Nenhum paciente encontrado para "${busca}"`
                    : "Nenhum paciente cadastrado"}
                </td>
              </tr>
            ) : (
              filtrados.map((p) => {
                const idade = calcularIdade(p.data_nascimento);
                return (
                  <tr
                    key={p.id}
                    style={podeVerLaudo ? { cursor: "pointer" } : undefined}
                    title={podeVerLaudo ? "Ver laudo e situação do paciente" : undefined}
                    onClick={() => abrirSituacao(p)}
                  >
                    <td style={s.td}>
                      <div style={s.av}>
                        {p.foto ? (
                          <img
                            src={`${UPLOADS_URL}/${p.foto}`}
                            alt={p.nome}
                            style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "1px solid #1a6fff", flexShrink: 0 }}
                          />
                        ) : (
                          <div style={s.avc}>{p.nome?.[0]?.toUpperCase()}</div>
                        )}
                        {p.nome}
                        {idade !== null && (
                          <span style={s.idade}>{idade} anos</span>
                        )}
                      </div>
                    </td>
                    <td style={s.td}>{p.cpf}</td>
                    <td style={s.td}>{formatDate(p.data_nascimento)}</td>
                    <td style={s.td}>
                      {p.cidade ? `${p.cidade}${p.estado ? ` — ${p.estado}` : ""}` : "—"}
                    </td>
                    <td style={s.td}>{p.telefone || "—"}</td>
                    <td style={s.td}>{p.email || "—"}</td>
                    <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                      <span
                        style={s.acao}
                        onClick={(e) => {
                          e.stopPropagation(); // nao deixa o clique abrir o laudo
                          abrirEdicao(p.id);
                        }}
                      >
                        Editar
                      </span>
                      <span style={{ color: "#ddd", margin: "0 8px" }}>·</span>
                      <span
                        style={s.acao}
                        onClick={(e) => {
                          e.stopPropagation();
                          escolherFoto(p.id);
                        }}
                      >
                        {p.foto ? "Trocar foto" : "+ Foto"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {editando && (
        <div style={s.overlay} onClick={() => setEditando(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <button style={s.modalClose} onClick={() => setEditando(null)}>✕</button>
            <div style={s.modalTitle}>Editar Paciente</div>
            <div style={s.modalSub}>
              CPF do paciente ({editando.cpf}) não é editável — é a identidade do registro
            </div>

            <div style={s.formGrid}>
              {erroEdicao && <div style={s.erroBox}>{erroEdicao}</div>}

              <div style={s.secTitle}><span style={s.secDot}></span>Dados do Paciente</div>
              <div style={s.field}>
                <label style={s.label}>Nome completo *</label>
                <input style={s.input} value={editando.nome || ""} onChange={(e) => alterarCampo("nome", e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Data de nascimento</label>
                <input style={s.input} type="date" value={editando.data_nascimento || ""} onChange={(e) => alterarCampo("data_nascimento", e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Sexo</label>
                <select style={s.input} value={editando.sexo || ""} onChange={(e) => alterarCampo("sexo", e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>E-mail</label>
                <input style={s.input} type="email" value={editando.email || ""} onChange={(e) => alterarCampo("email", e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Telefone</label>
                <input style={s.input} value={editando.telefone || ""} onChange={(e) => alterarCampo("telefone", e.target.value)} placeholder="+55 (DD) 9XXXX-XXXX" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Nome da mãe</label>
                <input style={s.input} value={editando.nome_mae || ""} onChange={(e) => alterarCampo("nome_mae", e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Nome do pai</label>
                <input style={s.input} value={editando.nome_pai || ""} onChange={(e) => alterarCampo("nome_pai", e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Cidade</label>
                <input style={s.input} value={editando.cidade || ""} onChange={(e) => alterarCampo("cidade", e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Estado (UF)</label>
                <input style={s.input} value={editando.estado || ""} onChange={(e) => alterarCampo("estado", e.target.value)} maxLength={2} />
              </div>

              <div style={s.secTitle}><span style={s.secDot}></span>Dados do Responsável</div>
              <div style={s.field}>
                <label style={s.label}>Nome do responsável *</label>
                <input style={s.input} value={editando.nome_responsavel || ""} onChange={(e) => alterarCampo("nome_responsavel", e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>CPF do responsável *</label>
                <input style={s.input} value={editando.cpf_responsavel || ""} onChange={(e) => alterarCampo("cpf_responsavel", e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Telefone do responsável *</label>
                <input style={s.input} value={editando.telefone_responsavel || ""} onChange={(e) => alterarCampo("telefone_responsavel", e.target.value)} placeholder="+55 (DD) 9XXXX-XXXX" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Grau de parentesco</label>
                <select style={s.input} value={editando.grau_parentesco || ""} onChange={(e) => alterarCampo("grau_parentesco", e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="mae">Mãe</option>
                  <option value="pai">Pai</option>
                  <option value="avo">Avó / Avô</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setEditando(null)}>Cancelar</button>
              <button style={s.btnSave} onClick={salvarEdicao} disabled={salvandoEdicao}>
                {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                <div style={s.btnBar}></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
