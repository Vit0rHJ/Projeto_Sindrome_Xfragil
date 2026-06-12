import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { getUser, UPLOADS_URL } from "../services/api";

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

  useEffect(() => {
    carregar();
  }, []);

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
                  <tr key={p.id}>
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
                    <td
                      style={{ ...s.td, color: "#1a6fff", cursor: "pointer", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}
                      onClick={() => escolherFoto(p.id)}
                    >
                      {p.foto ? "Trocar foto" : "+ Foto"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
