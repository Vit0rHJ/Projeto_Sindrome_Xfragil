import { useState } from "react";
// o useSearchParams le o consulta_id da url, por exemplo em /checklist?consulta_id=1 ele retorna 1
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { getUser } from "../services/api";

const SINTOMAS = [
  {
    id: "sin_atraso_fala",
    label: "Atraso na fala",
    desc: "Demorou para falar ou desenvolver linguagem",
  },
  {
    id: "sin_dif_aprendizado",
    label: "Dificuldade de aprendizado",
    desc: "Dificuldades no aprendizado escolar",
  },
  {
    id: "sin_deficit_atencao",
    label: "Déficit de atenção",
    desc: "Dificuldade de concentração e foco",
  },
  {
    id: "sin_def_intelectual",
    label: "Deficiência intelectual",
    desc: "Dificuldades de aprendizagem e desenvolvimento cognitivo",
  },
  {
    id: "sin_hiperatividade",
    label: "Hiperatividade",
    desc: "Agitação, impulsividade e déficit de atenção",
  },
  {
    id: "sin_agressividade",
    label: "Agressividade",
    desc: "Comportamentos agressivos recorrentes",
  },
  {
    id: "sin_evita_contato_visual",
    label: "Evita contato visual",
    desc: "Dificuldade em manter contato visual",
  },
  {
    id: "sin_evita_contato_fisico",
    label: "Evita contato físico",
    desc: "Aversão a toque ou contato físico",
  },
  {
    id: "sin_movimentos_repetitivos",
    label: "Movimentos repetitivos",
    desc: "Movimentos intencionais, repetitivos e ritmados",
  },
  {
    id: "sin_frouxidao",
    label: "Frouxidão ligamentar",
    desc: "Articulações mais flexíveis que o normal",
  },
  {
    id: "sin_macroquidia",
    label: "Macroquidia",
    desc: "Testículos de tamanho maior que o normal",
  },
  {
    id: "sin_face_alongada",
    label: "Face alongada",
    desc: "Face alongada, mandíbula proeminente e/ou orelhas de abano",
  },
];

const encLabel = {
  observacao: "Observação",
  auxilio_clinico: "Auxílio Clínico",
  medicacao: "Encaminhamento Prioritário",
};

const s = {
  wrap: {
    padding: "28px 32px",
    overflow: "auto",
    height: "calc(100vh - 62px)",
    background: "#fff",
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
  },
  sub: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 20,
  },
  progressTxt: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#aaa",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  progress: { background: "#e8e8e8", height: 3, marginBottom: 24 },
  progressBar: {
    background: "#1a6fff",
    height: "100%",
    transition: "width 0.3s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginBottom: 20,
  },
  card: {
    border: "1px solid #e8e8e8",
    padding: "14px 16px",
    cursor: "pointer",
    userSelect: "none",
  },
  cardActive: { border: "1px solid #1a6fff", background: "#f0f6ff" },
  checkbox: {
    width: 16,
    height: 16,
    border: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginBottom: 10,
  },
  checkboxActive: {
    background: "#1a6fff",
    border: "1px solid #1a6fff",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0a0a0a",
    marginBottom: 3,
  },
  cardDesc: { fontSize: 10, color: "#aaa", lineHeight: 1.4 },
  obsWrap: {
    border: "1px solid #e8e8e8",
    padding: "14px 16px",
    marginBottom: 20,
  },
  obsLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 8,
  },
  obs: {
    width: "100%",
    minHeight: 80,
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    fontSize: 12,
    color: "#0a0a0a",
    background: "#fafafa",
    resize: "vertical",
    outline: "none",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  footer: { display: "flex", justifyContent: "flex-end", gap: 12 },
  btnCancel: {
    fontSize: 9,
    letterSpacing: 2,
    padding: "8px 16px",
    border: "1px solid #e0e0e0",
    color: "#888",
    background: "#fff",
    cursor: "pointer",
    textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  btnSave: {
    fontSize: 9,
    letterSpacing: 2,
    padding: "8px 20px",
    border: "none",
    color: "#fff",
    background: "#0a0a0a",
    cursor: "pointer",
    textTransform: "uppercase",
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
  error: {
    background: "#fff0f0",
    border: "1px solid #ffcccc",
    color: "#cc0000",
    fontSize: 11,
    padding: "8px 12px",
    marginBottom: 16,
  },
  result: {
    border: "1px solid #e8e8e8",
    padding: "32px",
    textAlign: "center",
    maxWidth: 500,
  },
  resultEye: {
    fontSize: 8,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: "#1a6fff",
    marginBottom: 8,
  },
  resultTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    color: "#0a0a0a",
    letterSpacing: 2,
    marginBottom: 4,
  },
  resultScore: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 64,
    color: "#1a6fff",
    lineHeight: 1,
  },
  resultEnc: { fontSize: 14, color: "#555", marginTop: 8, marginBottom: 24 },
  btnLaudo: {
    fontSize: 10,
    letterSpacing: 2,
    padding: "10px 24px",
    border: "none",
    color: "#fff",
    background: "#1a6fff",
    cursor: "pointer",
    textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif",
    marginRight: 10,
  },
  btnHome: {
    fontSize: 10,
    letterSpacing: 2,
    padding: "10px 24px",
    border: "1px solid #e0e0e0",
    color: "#888",
    background: "#fff",
    cursor: "pointer",
    textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  ponderadoWrap: { margin: "20px 0" },
  ponderadoLabel: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#aaa",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  ponderadoValor: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 28,
    color: "#0a0a0a",
    marginBottom: 8,
  },
  ponderadoBarBg: {
    position: "relative",
    background: "#e8e8e8",
    height: 10,
    borderRadius: 5,
    overflow: "visible",
  },
  ponderadoBarFill: {
    height: "100%",
    borderRadius: 5,
    transition: "width 0.4s",
  },
  ponderadoLimiar: {
    position: "absolute",
    top: -4,
    bottom: -4,
    width: 2,
    background: "#0a0a0a",
  },
};

export default function Checklist() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const consultaId = params.get("consulta_id");
  const user = getUser();
  const isResponsavel = user?.perfil === "responsavel"; // verifica o perfil do usuario logado, se for responsavel, esconde o score e o botao de laudo no resultado

  const [marcados, setMarcados] = useState({});
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  // quando o checklist é salvo com sucesso , o backend retorna o score e encaminhamento, mostarndo uma tela de resultado em vez de forn=mulario
  const [resultado, setResultado] = useState(null);

  const total = Object.values(marcados).filter(Boolean).length;

  function toggle(id) {
    //marca ou desmarca  um sintoma, usa o spread ...prev para manter os outros sintomas e só altera o clicado
    setMarcados((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSubmit() {
    if (!consultaId) {
      setErro("ID da consulta não encontrado na URL.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      const body = {
        consulta_id: Number(consultaId),
        observacoes,
        preenchido_por: isResponsavel ? "responsavel" : "medico",
      };
      SINTOMAS.forEach((s) => {
        body[s.id] = marcados[s.id] ? 1 : 0;
      });
      const { data } = await api.post("/checklist", body);
      setResultado(data);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao salvar checklist.");
    } finally {
      setLoading(false);
    }
  }

  if (resultado) {
    return (
      <div style={s.wrap}>
        <div style={s.result}>
          <div style={s.resultEye}>resultado do checklist</div>
          <div style={s.resultTitle}>Avaliação concluída</div>
          {!isResponsavel && (
            <div style={s.resultScore}>{resultado.score_total}/12</div>
          )}
          {!isResponsavel && resultado.score_ponderado !== undefined && (
            <div style={s.ponderadoWrap}>
              <div style={s.ponderadoLabel}>
                <span>Score ponderado por sexo</span>
                <span>limiar {Number(resultado.limiar_usado).toFixed(2)}</span>
              </div>
              <div style={s.ponderadoValor}>
                {Number(resultado.score_ponderado).toFixed(4)}
              </div>
              <div style={s.ponderadoBarBg}>
                <div
                  style={{
                    ...s.ponderadoBarFill,
                    width: `${Math.min(Number(resultado.score_ponderado) * 100, 100)}%`,
                    background:
                      resultado.score_ponderado >= resultado.limiar_usado
                        ? "#e02020"
                        : "#1a6fff",
                  }}
                ></div>
                <div
                  style={{
                    ...s.ponderadoLimiar,
                    left: `${Math.min(Number(resultado.limiar_usado) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
          <div style={s.resultEnc}>
            Encaminhamento:{" "}
            <strong>
              {encLabel[resultado.encaminhamento] || resultado.encaminhamento}
            </strong>
          </div>
          {!isResponsavel && (
            <button
              style={s.btnLaudo}
              onClick={() => navigate(`/laudo/${resultado.consulta_id}`)}
            >
              Ver Laudo
            </button>
          )}
          <button style={s.btnHome} onClick={() => navigate("/home")}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.eye}>avaliação clínica</div>
      <div style={s.title}>Checklist de Sintomas</div>
      <div style={s.sub}>
        Consulta #{consultaId} — marque os sintomas observados no paciente
      </div>

      <div style={s.progressTxt}>
        <span>
          {total} de {SINTOMAS.length} sintomas marcados
        </span>
        <span>{Math.round((total / SINTOMAS.length) * 100)}%</span>
      </div>
      <div style={s.progress}>
        <div
          style={{
            ...s.progressBar,
            width: `${(total / SINTOMAS.length) * 100}%`,
          }}
        ></div>
      </div>

      {erro && <div style={s.error}>{erro}</div>}

      <div style={s.grid}>
        {SINTOMAS.map((sint) => {
          const ativo = !!marcados[sint.id];
          return (
            <div
              key={sint.id}
              style={{ ...s.card, ...(ativo ? s.cardActive : {}) }}
              onClick={() => toggle(sint.id)}
            >
              <div
                style={{ ...s.checkbox, ...(ativo ? s.checkboxActive : {}) }}
              >
                {ativo && "✓"}
              </div>
              <div style={s.cardLabel}>{sint.label}</div>
              <div style={s.cardDesc}>{sint.desc}</div>
            </div>
          );
        })}
      </div>

      <div style={s.obsWrap}>
        <div style={s.obsLabel}>Observações</div>
        <textarea
          style={s.obs}
          placeholder="Anote observações clínicas relevantes..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>

      <div style={s.footer}>
        <button style={s.btnCancel} onClick={() => navigate("/home")}>
          Cancelar
        </button>
        <button style={s.btnSave} onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : `Gerar Encaminhamento (${total})`}
          <div style={s.btnBar}></div>
        </button>
      </div>
    </div>
  );
}
