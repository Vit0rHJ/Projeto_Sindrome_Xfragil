import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { getUser } from "../services/api";
import Avatar from "../components/Avatar";

const s = {
  wrap: { display: "flex", height: "calc(100vh - 62px)", overflow: "hidden" },
  left: {
    flex: 1,
    background: "#fff",
    padding: "28px 32px",
    position: "relative",
    overflow: "auto",
    borderRight: "3px solid #0a0a0a",
  },
  right: {
    width: 300,
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
    fontSize: 42,
    letterSpacing: 2,
    color: "#0a0a0a",
    lineHeight: 1,
  },
  sub: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 22,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginBottom: 22,
  },
  stat: {
    border: "1px solid #e8e8e8",
    padding: "12px 14px",
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
  sv: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 38,
    color: "#0a0a0a",
    lineHeight: 1,
  },
  sl: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#bbb",
    textTransform: "uppercase",
    marginTop: 2,
  },
  thd: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ttl: {
    fontSize: 8,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#bbb",
  },
  btn: {
    fontSize: 9,
    letterSpacing: 2,
    padding: "5px 13px",
    border: "1px solid #0a0a0a",
    color: "#0a0a0a",
    background: "#fff",
    cursor: "pointer",
    textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif",
  },
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
  bd: {
    display: "inline-block",
    fontSize: 8,
    letterSpacing: 1,
    padding: "2px 8px",
    color: "#20c850",
    border: "1px solid #20c850",
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
    fontSize: 24,
    letterSpacing: 2,
    color: "#fff",
    marginBottom: 16,
  },
  ai: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "9px 0",
    borderBottom: "1px solid #141414",
  },
  at: {
    fontSize: 9,
    color: "#2a2a2a",
    letterSpacing: 1,
    width: 36,
    flexShrink: 0,
    marginTop: 2,
  },
  aline: { width: 1, minHeight: 30, background: "#1a1a1a", flexShrink: 0 },
  an: { fontSize: 11, color: "#888", fontWeight: 500 },
  ad: { fontSize: 9, color: "#3a3a3a", marginTop: 2 },
  atg: {
    fontSize: 8,
    letterSpacing: 1,
    padding: "2px 7px",
    flexShrink: 0,
    marginTop: 2,
    color: "#1a6fff",
    border: "1px solid #1a6fff22",
  },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

const diasSemana = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function Home() {
  const navigate = useNavigate();
  const user = getUser();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // serve para executar a busca de consultas assim q a pagina carrega
    api
      .get("/consultas")
      .then((r) => setConsultas(r.data))
      .finally(() => setLoading(false));
  }, []); // esse array vazio [] gaeante q so rode uma vez

  const pendentes = consultas.filter((c) => c.status === "pendente");
  const realizadas = consultas.filter((c) => c.status === "realizada").length;

  const hoje = new Date();
  const dataFmt = `${diasSemana[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <div style={s.corner}></div>
        <div style={s.eye}>painel principal</div>
        <div style={s.title}>Olá, {user?.nome?.split(" ")[0]}</div>
        <div style={s.sub}>{dataFmt}</div>

        <div style={s.grid}>
          <div style={s.stat}>
            <div style={s.sv}>
              {loading ? "—" : String(consultas.length).padStart(2, "0")}
            </div>
            <div style={s.sl}>consultas totais</div>
            <div style={s.statBar}></div>
          </div>
          <div style={s.stat}>
            <div style={s.sv}>
              {loading ? "—" : String(pendentes.length).padStart(2, "0")}
            </div>
            <div style={s.sl}>pendentes</div>
            <div style={s.statBar}></div>
          </div>
          <div style={s.stat}>
            <div style={s.sv}>
              {loading ? "—" : String(realizadas).padStart(2, "0")}
            </div>
            <div style={s.sl}>realizadas</div>
            <div style={s.statBar}></div>
          </div>
        </div>

        <div style={s.thd}>
          <div style={s.ttl}>consultas pendentes</div>
          <button style={s.btn} onClick={() => navigate("/cadastro")}>
            + nova consulta
          </button>
        </div>

        {loading ? (
          <div style={{ fontSize: 12, color: "#aaa", padding: "16px 0" }}>
            Carregando...
          </div>
        ) : (
          <table style={s.tbl}>
            <thead>
              <tr>
                <th style={s.th}>Paciente</th>
                <th style={s.th}>Data</th>
                <th style={s.th}>Status</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {pendentes.length === 0 ? (
                <tr>
                  <td
                    style={{ ...s.td, color: "#bbb", fontStyle: "italic" }}
                    colSpan={4}
                  >
                    Nenhuma consulta pendente
                  </td>
                </tr>
              ) : (
                pendentes.map((c) => (
                  <tr key={c.id}>
                    <td style={s.td}>
                      <div style={s.av}>
                        <Avatar nome={c.paciente_nome} foto={c.paciente_foto} />
                        {c.paciente_nome}
                      </div>
                    </td>
                    <td style={s.td}>{formatDate(c.data_consulta)}</td>
                    <td style={s.td}>
                      <span style={s.bp}>Pendente</span>
                    </td>
                    <td
                      style={{
                        ...s.td,
                        color: "#1a6fff",
                        cursor: "pointer",
                        fontSize: 10,
                        letterSpacing: 1,
                      }}
                      onClick={() => navigate(`/checklist?consulta_id=${c.id}`)}
                    >
                      Ver →
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={s.right}>
        <div style={s.reye}>atividade recente</div>
        <div style={s.rtitle}>Últimas Ações</div>
        {consultas.slice(0, 5).map(
          (
            c, // mostra apenas as 5 consultas mais recentes no painel de atividade
          ) => (
            <div key={c.id} style={s.ai}>
              <div style={s.at}>{formatDate(c.data_consulta)}</div>
              <div style={s.aline}></div>
              <div style={{ flex: 1 }}>
                <div style={s.an}>{c.paciente_nome}</div>
                <div style={s.ad}>{c.status}</div>
              </div>
              <span style={s.atg}>consulta</span>
            </div>
          ),
        )}

        {/* o responsavel nao ve dados de encaminhamento (regra do requisito) */}
        {user?.perfil !== "responsavel" && (
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #141414",
          }}
        >
          <div style={{ ...s.reye, marginBottom: 12 }}>encaminhamentos</div>
          {[
            {
              label: "Observação",
              val: consultas.filter((c) => c.encaminhamento === "observacao")
                .length,
            },
            {
              label: "Auxílio Clínico",
              val: consultas.filter(
                (c) => c.encaminhamento === "auxilio_clinico",
              ).length,
            },
            {
              label: "Prioritário",
              val: consultas.filter((c) => c.encaminhamento === "medicacao")
                .length,
            },
          ].map((e) => (
            <div
              key={e.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 10, color: "#444", letterSpacing: 1 }}>
                {e.label}
              </span>
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 20,
                  color: "#1a6fff",
                }}
              >
                {String(e.val).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
