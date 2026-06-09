import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarChecklist } from '../services/api';

const SINTOMA_LABELS = {
  sin_atraso_fala:           'Atraso na fala',
  sin_dif_aprendizado:       'Dificuldade de aprendizado',
  sin_deficit_atencao:       'Déficit de atenção',
  sin_def_intelectual:       'Deficiência intelectual',
  sin_hiperatividade:        'Hiperatividade',
  sin_agressividade:         'Agressividade',
  sin_evita_contato_visual:  'Evita contato visual',
  sin_evita_contato_fisico:  'Evita contato físico',
  sin_movimentos_repetitivos:'Movimentos repetitivos',
  sin_frouxidao:             'Frouxidão muscular (hipotonia)',
  sin_macroquidia:           'Macroorquidia',
  sin_face_alongada:         'Face alongada / orelhas proeminentes',
};

export default function Laudo() {
  const { consultaId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [dados, setDados]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]     = useState('');

  useEffect(() => {
    buscarChecklist(consultaId)
      .then(setDados)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, [consultaId]);

  const handlePrint = () => window.print();

  if (loading) return <div className="loading-wrap"><div className="spinner"></div><p>Carregando laudo...</p></div>;
  if (erro)    return <div><div className="alert alert-error">{erro}</div><button className="btn-secondary" onClick={() => navigate('/dashboard')}>← Voltar</button></div>;
  if (!dados)  return <div><div className="alert alert-warn">Checklist não encontrado para esta consulta.</div><button className="btn-secondary" onClick={() => navigate('/dashboard')}>← Voltar</button></div>;

  const sintomasPresentes = Object.entries(SINTOMA_LABELS).filter(([k]) => dados[k] === 1 || dados[k] === true);
  const score = dados.score_total ?? sintomasPresentes.length;
  const encaminhamento = dados.encaminhamento || (score >= 8 ? 'Encaminhar para genética médica' : score >= 4 ? 'Avaliação especializada recomendada' : 'Acompanhamento clínico regular');

  const getScoreColor = () => {
    if (score <= 3) return 'var(--teal)';
    if (score <= 7) return '#856404';
    return 'var(--danger)';
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h2>Laudo de Triagem</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>Consulta #{consultaId}</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <button className="btn-primary" onClick={handlePrint}>🖨 Imprimir</button>
      </div>

      <div className="card" ref={printRef}>
        {/* Cabeçalho do laudo */}
        <div className="laudo-header">
          <div>
            <div className="laudo-logo">Instituto X Frágil</div>
            <div className="laudo-sub">Síndrome do X Frágil — Triagem Clínica</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Data de emissão</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{new Date().toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        {/* Dados da consulta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="laudo-field">
            <div className="laudo-field-label">Paciente</div>
            <div className="laudo-field-value">{dados.paciente_nome || `ID ${dados.paciente_id || '—'}`}</div>
          </div>
          <div className="laudo-field">
            <div className="laudo-field-label">Médico responsável</div>
            <div className="laudo-field-value">{dados.medico_nome || '—'}</div>
          </div>
          <div className="laudo-field">
            <div className="laudo-field-label">Data da consulta</div>
            <div className="laudo-field-value">{dados.data_consulta ? new Date(dados.data_consulta).toLocaleDateString('pt-BR') : '—'}</div>
          </div>
          <div className="laudo-field">
            <div className="laudo-field-label">Checklist preenchido por</div>
            <div className="laudo-field-value" style={{ textTransform: 'capitalize' }}>{dados.preenchido_por || '—'}</div>
          </div>
          <div className="laudo-field">
            <div className="laudo-field-label">Consulta nº</div>
            <div className="laudo-field-value">#{consultaId}</div>
          </div>
        </div>

        {/* Score */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '1.5rem', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'Lora, serif', color: getScoreColor(), lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>de 12 pontos</div>
            <div style={{ marginTop: '0.75rem', fontSize: 13, fontWeight: 600, color: getScoreColor() }}>
              {score <= 3 ? 'Baixa suspeita' : score <= 7 ? 'Suspeita moderada' : 'Alta suspeita'}
            </div>
          </div>
          <div style={{ background: score >= 8 ? '#fce8e8' : score >= 4 ? 'var(--warn-bg)' : 'var(--teal-light)', borderRadius: 'var(--radius)', padding: '1.5rem', border: `1px solid ${score >= 8 ? '#f5a5a5' : score >= 4 ? 'var(--warn-border)' : '#9fe1cb'}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>Encaminhamento</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: getScoreColor(), marginBottom: 8 }}>{encaminhamento}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {score <= 3 && 'Score baixo. Não foram identificados sinais expressivos. Recomenda-se acompanhamento clínico regular e retorno em caso de novos sintomas.'}
              {score > 3 && score <= 7 && 'Score moderado. Há sinais que justificam avaliação por especialista. Considerar encaminhamento para neuropediatria ou genética médica.'}
              {score > 7 && 'Score alto. Perfil sintomático consistente com Síndrome do X Frágil. Encaminhamento urgente para genética médica recomendado para confirmação diagnóstica por exame molecular (PCR).'}
            </div>
          </div>
        </div>

        {/* Sintomas */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">Sintomas identificados ({sintomasPresentes.length}/12)</div>
          {sintomasPresentes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhum sintoma marcado.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {sintomasPresentes.map(([k, label]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--blue-light)', borderRadius: 6, fontSize: 14 }}>
                  <span style={{ color: 'var(--blue)', fontWeight: 600 }}>✓</span> {label}
                </div>
              ))}
            </div>
          )}
          {Object.entries(SINTOMA_LABELS).filter(([k]) => !dados[k]).length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Não observados</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.entries(SINTOMA_LABELS).filter(([k]) => !dados[k]).map(([k, label]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>—</span> {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comentário */}
        {dados.comentario && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="section-title">Observações clínicas</div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '1rem', fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
              {dados.comentario}
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Instituto X Frágil — contato@institutoxfragil.org.br — (41) 3156-0509</span>
          <span>Documento gerado em {new Date().toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <style>{`@media print { .page-header button, .sidebar { display: none !important; } .main-content { padding: 0 !important; } }`}</style>
    </div>
  );
}
