import { useState, useEffect } from "react";
import api from "../services/api";

const s = {
  wrap: { padding: "28px 32px", overflow: "auto", height: "calc(100vh - 62px)", background: "#fff" },
  eye: { fontSize: 8, letterSpacing: 4, textTransform: "uppercase", color: "#1a6fff", marginBottom: 5 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 2, color: "#0a0a0a", lineHeight: 1, marginBottom: 4 },
  sub: { fontSize: 10, color: "#999", letterSpacing: 1, marginBottom: 20, maxWidth: 720, lineHeight: 1.6 },
  tbl: { width: "100%", borderCollapse: "collapse", maxWidth: 900 },
  th: { fontSize: 8, letterSpacing: 2, color: "#ccc", textTransform: "uppercase", textAlign: "left", padding: "6px 10px", borderBottom: "1px solid #e8e8e8", background: "#fafafa" },
  td: { fontSize: 11, color: "#555", padding: "8px 10px", borderBottom: "1px solid #f0f0f0" },
  inputPeso: {
    width: 70, padding: "6px 8px", border: "1px solid #e0e0e0", fontSize: 12,
    color: "#0a0a0a", background: "#fafafa", outline: "none", textAlign: "center",
  },
  catTag: { display: "inline-block", fontSize: 8, letterSpacing: 1, padding: "2px 8px", textTransform: "uppercase" },
  btnSalvar: {
    fontSize: 8, letterSpacing: 1, padding: "5px 12px", border: "none", color: "#fff",
    background: "#0a0a0a", cursor: "pointer", textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  somaCard: {
    display: "flex", gap: 24, alignItems: "center", marginTop: 18, padding: "12px 16px",
    border: "1px solid #e8e8e8", maxWidth: 900,
  },
  somaVal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, lineHeight: 1 },
  somaLabel: { fontSize: 8, letterSpacing: 2, color: "#aaa", textTransform: "uppercase" },
  success: { background: "#f0fff4", border: "1px solid #ccffcc", color: "#006600", fontSize: 11, padding: "8px 12px", marginBottom: 12, maxWidth: 900 },
  error: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", fontSize: 11, padding: "8px 12px", marginBottom: 12, maxWidth: 900 },
};

const CATEGORIA_LABEL = {
  cognitivo_comportamental: { texto: "Cognitivo", cor: "#1a6fff" },
  fisico: { texto: "Físico", cor: "#e8a020" },
};

export default function AdminSintomas() {
  const [sintomas, setSintomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(null);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    api
      .get("/sintomas")
      .then((r) => setSintomas(r.data))
      .finally(() => setLoading(false));
  }

  function alterarCampo(id, campo, valor) {
    setSintomas((prev) =>
      prev.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)),
    );
  }

  async function salvar(sintoma) {
    setMsg("");
    setErro("");
    setSalvando(sintoma.id);
    try {
      await api.put(`/sintomas/${sintoma.id}`, {
        peso_masculino: Number(sintoma.peso_masculino),
        peso_feminino: Number(sintoma.peso_feminino),
        ativo: sintoma.ativo ? 1 : 0,
      });
      setMsg(`"${sintoma.nome}" atualizado com sucesso.`);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao salvar sintoma.");
    } finally {
      setSalvando(null);
    }
  }

  // soma dos pesos dos sintomas ativos: o ideal é fechar 1.00 por sexo,
  // para o score ponderado continuar comparável aos limiares (0.56/0.55)
  const ativos = sintomas.filter((x) => x.ativo);
  const somaM = ativos.reduce((acc, x) => acc + Number(x.peso_masculino || 0), 0);
  const somaF = ativos.reduce((acc, x) => acc + Number(x.peso_feminino || 0), 0);
  const somaOk = (v) => Math.abs(v - 1) < 0.001;

  return (
    <div style={s.wrap}>
      <div style={s.eye}>administração · calibragem clínica</div>
      <div style={s.title}>Sintomas do Checklist</div>
      <div style={s.sub}>
        Ajuste a gravidade (peso) de cada sintoma por sexo e ative/desative
        itens do checklist. As alterações valem para as próximas avaliações,
        sem precisar alterar o código do sistema. A soma dos pesos ativos deve
        fechar 1.00 em cada sexo para manter o score comparável aos limiares.
      </div>

      {msg && <div style={s.success}>{msg}</div>}
      {erro && <div style={s.error}>{erro}</div>}

      {loading ? (
        <div style={{ fontSize: 12, color: "#aaa" }}>Carregando sintomas...</div>
      ) : (
        <table style={s.tbl}>
          <thead>
            <tr>
              <th style={s.th}>Sintoma</th>
              <th style={s.th}>Categoria</th>
              <th style={s.th}>Peso Masculino</th>
              <th style={s.th}>Peso Feminino</th>
              <th style={s.th}>Ativo</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {sintomas.map((x) => {
              const cat = CATEGORIA_LABEL[x.categoria] || { texto: x.categoria, cor: "#888" };
              return (
                <tr key={x.id} style={x.ativo ? undefined : { opacity: 0.45 }}>
                  <td style={{ ...s.td, fontWeight: 600, color: "#0a0a0a" }}>{x.nome}</td>
                  <td style={s.td}>
                    <span style={{ ...s.catTag, color: cat.cor, border: `1px solid ${cat.cor}` }}>
                      {cat.texto}
                    </span>
                  </td>
                  <td style={s.td}>
                    <input
                      style={s.inputPeso}
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={x.peso_masculino}
                      onChange={(e) => alterarCampo(x.id, "peso_masculino", e.target.value)}
                    />
                  </td>
                  <td style={s.td}>
                    <input
                      style={s.inputPeso}
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={x.peso_feminino}
                      onChange={(e) => alterarCampo(x.id, "peso_feminino", e.target.value)}
                    />
                  </td>
                  <td style={s.td}>
                    <input
                      type="checkbox"
                      checked={!!x.ativo}
                      onChange={(e) => alterarCampo(x.id, "ativo", e.target.checked ? 1 : 0)}
                      style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#1a6fff" }}
                    />
                  </td>
                  <td style={s.td}>
                    <button
                      style={s.btnSalvar}
                      disabled={salvando === x.id}
                      onClick={() => salvar(x)}
                    >
                      {salvando === x.id ? "..." : "Salvar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!loading && (
        <div style={s.somaCard}>
          <div>
            <div style={{ ...s.somaVal, color: somaOk(somaM) ? "#20c850" : "#e02020" }}>
              {somaM.toFixed(2)}
            </div>
            <div style={s.somaLabel}>soma pesos masculino</div>
          </div>
          <div>
            <div style={{ ...s.somaVal, color: somaOk(somaF) ? "#20c850" : "#e02020" }}>
              {somaF.toFixed(2)}
            </div>
            <div style={s.somaLabel}>soma pesos feminino</div>
          </div>
          {(!somaOk(somaM) || !somaOk(somaF)) && (
            <div style={{ fontSize: 10, color: "#e02020", maxWidth: 380, lineHeight: 1.5 }}>
              Atenção: a soma dos pesos ativos está diferente de 1.00 — o score
              ponderado deixará de ser diretamente comparável aos limiares.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
