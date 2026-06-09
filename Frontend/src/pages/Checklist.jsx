import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salvarChecklist, buscarChecklist } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SINTOMAS = [
  { key: 'sin_atraso_fala',            label: 'Atraso na fala',                      desc: 'Demorou para falar ou desenvolver linguagem' },
  { key: 'sin_dif_aprendizado',        label: 'Dificuldade de aprendizado',          desc: 'Dificuldades no aprendizado escolar' },
  { key: 'sin_deficit_atencao',        label: 'Déficit de atenção',                  desc: 'Dificuldade de concentração e foco' },
  { key: 'sin_def_intelectual',        label: 'Deficiência intelectual',             desc: 'Dificuldades de aprendizagem e desenvolvimento cognitivo' },
  { key: 'sin_hiperatividade',         label: 'Hiperatividade',                      desc: 'Agitação, impulsividade e déficit de atenção' },
  { key: 'sin_agressividade',          label: 'Agressividade',                       desc: 'Comportamentos agressivos recorrentes' },
  { key: 'sin_evita_contato_visual',   label: 'Evita contato visual',               desc: 'Dificuldade em manter contato visual' },
  { key: 'sin_evita_contato_fisico',   label: 'Evita contato físico',               desc: 'Aversão a toque ou contato físico' },
  { key: 'sin_movimentos_repetitivos', label: 'Movimentos repetitivos',             desc: 'Movimentos intencionais, repetitivos e ritmados' },
  { key: 'sin_frouxidao',              label: 'Frouxidão ligamentar',               desc: 'Articulações mais flexíveis que o normal' },
  { key: 'sin_macroquidia',            label: 'Macroquidia',                        desc: 'Testículos de tamanho maior que o normal' },
  { key: 'sin_face_alongada',          label: 'Face alongada',                      desc: 'Face alongada, mandíbula proeminente e/ou orelhas de abano' },
];

const INIT_CHECKS = Object.fromEntries(SINTOMAS.map(s => [s.key, false]));

export default function Checklist() {
  const { consultaId } = useParams();
  const navigate       = useNavigate();
  const { canViewAll } = useAuth();

  const [checks,        setChecks]        = useState(INIT_CHECKS);
  const [comentario,    setComentario]    = useState('');
  const [observacoes,   setObservacoes]   = useState('');
  const [preenchidoPor, setPreenchidoPor] = useState('medico');
  const [loading,       setLoading]       = useState(false);
  const [existing,      setExisting]      = useState(null);
  const [loadingExist,  setLoadingExist]  = useState(true);
  const [erro,          setErro]          = useState('');

  useEffect(() => {
    buscarChecklist(consultaId)
      .then(data => setExisting(data))
      .catch(() => setExisting(null))
      .finally(() => setLoadingExist(false));
  }, [consultaId]);

  const toggle = (key) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  const score  = Object.values(checks).filter(Boolean).length;

  const getScoreClass = () => {
    if (score <= 3) return 'low';
    if (score <= 7) return 'medium';
    return 'high';
  };

  const getEncaminhamento = () => {
    if (score <= 3) return { label: 'Baixa suspeita',                        color: 'var(--teal)',    msg: 'Score baixo. Acompanhamento clínico regular recomendado.' };
    if (score <= 7) return { label: 'Suspeita moderada',                     color: '#856404',        msg: 'Score moderado. Recomenda-se avaliação especializada.' };
    return          { label: 'Alta suspeita — encaminhar para genética',     color: 'var(--danger)',  msg: 'Score alto. Encaminhamento urgente para genética médica recomendado.' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      await salvarChecklist({
        consulta_id:   Number(consultaId),
        preenchido_por: preenchidoPor,
        comentario,
        observacoes,
        ...Object.fromEntries(Object.entries(checks).map(([k, v]) => [k, v ? 1 : 0])),
      });
      navigate(`/laudo/${consultaId}`);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingExist) return (
    <div className="loading-wrap">
      <div className="spinner"></div>
      <p>Verificando checklist...</p>
    </div>
  );

  if (existing) return (
    <div>
      <div className="page-header">
        <h2>Checklist — Consulta #{consultaId}</h2>
      </div>
      <div className="alert alert-warn">Este checklist já foi preenchido para esta consulta.</div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn-primary"   onClick={() => navigate(`/laudo/${consultaId}`)}>Ver Laudo →</button>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>← Voltar ao Dashboard</button>
      </div>
    </div>
  );

  const enc = getEncaminhamento();

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Checklist de Sintomas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>
            Consulta #{consultaId} — marque todos os sintomas observados
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>← Voltar</button>
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Coluna esquerda ── */}
          <div>
            {/* Barra de progresso */}
            <div className="card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {score} de {SINTOMAS.length} sintomas marcados
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>
                  {Math.round((score / SINTOMAS.length) * 100)}%
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--blue-light)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(score / SINTOMAS.length) * 100}%`, background: 'linear-gradient(90deg, var(--blue), var(--blue-mid))', borderRadius: 999, transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Lista de sintomas */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="section-title">Sintomas</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {SINTOMAS.map(s => (
                  <div
                    key={s.key}
                    className={`symptom-item ${checks[s.key] ? 'checked' : ''}`}
                    onClick={() => toggle(s.key)}
                  >
                    <input
                      type="checkbox"
                      checked={checks[s.key]}
                      onChange={() => toggle(s.key)}
                      onClick={e => e.stopPropagation()}
                    />
                    <div>
                      <div className="symptom-label">{s.label}</div>
                      <div className="symptom-desc">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="card">
              <div className="section-title">Observações e Comentários</div>
              <div className="form-group">
                <label>Preenchido por</label>
                <select value={preenchidoPor} onChange={e => setPreenchidoPor(e.target.value)}>
                  <option value="medico">Médico(a)</option>
                  <option value="secretaria">Secretaria</option>
                  <option value="responsavel">Responsável pelo paciente</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comentário adicional (opcional)</label>
                <textarea
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  rows={3}
                  placeholder="Observações clínicas, contexto familiar, comportamentos adicionais relevantes..."
                />
              </div>
            </div>
          </div>

          {/* ── Painel lateral ── */}
          <div style={{ position: 'sticky', top: '1rem' }}>

            {/* Score */}
            <div className={`score-box ${getScoreClass()}`} style={{ marginBottom: '1rem' }}>
              <div className="score-num" style={{ color: enc.color }}>{score}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>de 12 sintomas</div>
              <div style={{ marginTop: '0.75rem', fontWeight: 600, fontSize: 14, color: enc.color }}>{enc.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>{enc.msg}</div>
            </div>

            {/* Lista dos marcados */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {score === 0 ? 'Nenhum sintoma marcado ainda.' : `${score} sintoma(s) selecionado(s):`}
              </p>
              <ul style={{ paddingLeft: '1rem', listStyle: 'disc' }}>
                {SINTOMAS.filter(s => checks[s.key]).map(s => (
                  <li key={s.key} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{s.label}</li>
                ))}
              </ul>
            </div>

            {/* Observações do médico */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                Observações do médico
              </label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                placeholder="Anote observações clínicas relevantes..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Salvando...' : 'Salvar e ver laudo →'}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
