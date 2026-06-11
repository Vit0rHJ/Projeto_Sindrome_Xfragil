import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api, { getUser } from "../services/api";

const s = {
  wrap: { padding: "28px 32px", overflow: "auto", height: "calc(100vh - 62px)", background: "#fff" },
  eye: { fontSize: 8, letterSpacing: 4, textTransform: "uppercase", color: "#1a6fff", marginBottom: 5 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 2, color: "#0a0a0a", lineHeight: 1, marginBottom: 4 },
  sub: { fontSize: 10, color: "#999", letterSpacing: 1, marginBottom: 24 },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 },
  btnCsv: {
    fontSize: 9, letterSpacing: 2, padding: "10px 20px", border: "none", color: "#fff",
    background: "#0a0a0a", cursor: "pointer", textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif", position: "relative",
  },
  btnBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#1a6fff" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 },
  statCard: { border: "1px solid #1a1a1a", padding: "14px 16px", position: "relative", background: "#0a0a0a" },
  statBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#1a6fff" },
  statVal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#1a6fff", lineHeight: 1 },
  statLabel: { fontSize: 8, letterSpacing: 2, color: "#999", textTransform: "uppercase", marginTop: 4 },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 },
  chartCard: { border: "1px solid #e8e8e8", padding: "16px 18px" },
  chartTitle: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 14 },
  sectionTitle: { fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#bbb", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #e8e8e8", marginTop: 28 },
  tbl: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: 8, letterSpacing: 2, color: "#ccc", textTransform: "uppercase", textAlign: "left", padding: "6px 10px", borderBottom: "1px solid #e8e8e8", background: "#fafafa" },
  td: { fontSize: 11, color: "#555", padding: "9px 10px", borderBottom: "1px solid #f0f0f0" },
};

const ENC_LABEL = {
  observacao: "Observação",
  auxilio_clinico: "Auxílio Clínico",
  medicacao: "Encaminhamento Prioritário",
};

const ENC_COLOR = {
  observacao: "#1a6fff",
  auxilio_clinico: "#e8a020",
  medicacao: "#e02020",
};

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR");
}

export default function Relatorios() {
  const user = getUser();
  const isAdmin = user?.perfil === "admin";
  const [dados, setDados] = useState(null);
  const [auditoria, setAuditoria] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requisicoes = [api.get("/relatorios/agregado")];
    if (isAdmin) requisicoes.push(api.get("/relatorios/auditoria"));

    Promise.all(requisicoes)
      .then(([r1, r2]) => {
        setDados(r1.data);
        if (r2) setAuditoria(r2.data);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  async function exportarCsv() {
    try {
      const response = await api.get("/relatorios/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "relatorio_avaliacoes.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Erro ao exportar CSV.");
    }
  }

  if (loading) return <div style={s.wrap}><div style={{ fontSize: 12, color: "#aaa" }}>Carregando relatórios...</div></div>;
  if (!dados) return null;

  const distribuicao = dados.distribuicao_encaminhamento.map((d) => ({
    name: ENC_LABEL[d.encaminhamento] || d.encaminhamento,
    value: d.total,
    cor: ENC_COLOR[d.encaminhamento] || "#888",
  }));

  return (
    <div style={s.wrap}>
      <div style={s.topRow}>
        <div>
          <div style={s.eye}>painel administrativo</div>
          <div style={s.title}>Relatórios</div>
          <div style={s.sub}>Visão agregada das avaliações realizadas no sistema</div>
        </div>
        <button style={s.btnCsv} onClick={exportarCsv}>
          Exportar CSV
          <div style={s.btnBar}></div>
        </button>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statVal}>{dados.totais.total_pacientes}</div>
          <div style={s.statLabel}>pacientes cadastrados</div>
          <div style={s.statBar}></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statVal}>{dados.totais.total_consultas}</div>
          <div style={s.statLabel}>consultas registradas</div>
          <div style={s.statBar}></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statVal}>{dados.totais.total_avaliacoes}</div>
          <div style={s.statLabel}>checklists avaliados</div>
          <div style={s.statBar}></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statVal}>
            {dados.totais.total_avaliacoes > 0
              ? Math.round((distribuicao.find(d => d.name === ENC_LABEL.medicacao)?.value || 0) / dados.totais.total_avaliacoes * 100)
              : 0}%
          </div>
          <div style={s.statLabel}>taxa de encaminhamento prioritário</div>
          <div style={s.statBar}></div>
        </div>
      </div>

      <div style={s.chartsGrid}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>distribuição de encaminhamentos</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={distribuicao} dataKey="value" nameKey="name" outerRadius={80} label>
                  {distribuicao.map((entry, i) => <Cell key={i} fill={entry.cor} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>evolução mensal das avaliações</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={dados.evolucao_mensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total_avaliacoes" name="Avaliações" stroke="#1a6fff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>score ponderado médio por sexo</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dados.por_sexo.map(p => ({ ...p, sexo: p.sexo === "M" ? "Masculino" : p.sexo === "F" ? "Feminino" : "Não informado" }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="sexo" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="media_score_ponderado" name="Score ponderado médio" fill="#1a6fff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>avaliações por médico</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dados.por_medico} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="medico_nome" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="total_avaliacoes" name="Avaliações" fill="#1a6fff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isAdmin && (
        <>
          <div style={s.sectionTitle}>trilha de auditoria (LGPD)</div>
          <table style={s.tbl}>
            <thead>
              <tr>
                <th style={s.th}>Data/Hora</th>
                <th style={s.th}>Usuário</th>
                <th style={s.th}>Perfil</th>
                <th style={s.th}>Ação</th>
                <th style={s.th}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {auditoria.length === 0 ? (
                <tr><td style={{ ...s.td, color: "#bbb", fontStyle: "italic" }} colSpan={5}>Nenhum registro de auditoria</td></tr>
              ) : (
                auditoria.map((log) => (
                  <tr key={log.id}>
                    <td style={s.td}>{formatDateTime(log.criado_em)}</td>
                    <td style={s.td}>{log.usuario_nome || "—"}</td>
                    <td style={s.td}>{log.perfil || "—"}</td>
                    <td style={s.td}>{log.acao}</td>
                    <td style={s.td}>{log.detalhes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
