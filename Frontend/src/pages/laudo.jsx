import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import api from '../services/api'
import Avatar from '../components/Avatar'

const s = {
  wrap: { display: 'flex', height: 'calc(100vh - 62px)', overflow: 'hidden' },
  left: { flex: 1, background: '#fff', padding: '28px 32px', overflow: 'auto', borderRight: '3px solid #0a0a0a', position: 'relative' },
  right: { width: 280, flexShrink: 0, background: '#0a0a0a', padding: '24px 22px', overflow: 'auto' },
  corner: { position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 26px 26px 0', borderColor: 'transparent #1a6fff transparent transparent' },
  eye: { fontSize: 8, letterSpacing: 4, textTransform: 'uppercase', color: '#1a6fff', marginBottom: 5 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 2, color: '#0a0a0a', lineHeight: 1, marginBottom: 20 },
  sectionTitle: { fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#bbb', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e8e8e8', marginTop: 20 },
  row: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  rowLabel: { fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#bbb', width: 150, flexShrink: 0 },
  rowVal: { fontSize: 12, color: '#333' },
  footer: { display: 'flex', gap: 10, marginTop: 28 },
  btnBack: { fontSize: 9, letterSpacing: 2, padding: '8px 16px', border: '1px solid #e0e0e0', color: '#888', background: '#fff', cursor: 'pointer', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" },
  btnPdf: { fontSize: 9, letterSpacing: 2, padding: '8px 20px', border: 'none', color: '#fff', background: '#0a0a0a', cursor: 'pointer', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", position: 'relative' },
  btnBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#1a6fff' },
  reye: { fontSize: 8, letterSpacing: 4, textTransform: 'uppercase', color: '#1a6fff', marginBottom: 6 },
  rtitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#fff', marginBottom: 16 },
  score: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: '#1a6fff', lineHeight: 1 },
  scoreLabel: { fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#446', marginTop: 3 },
  encTag: { display: 'inline-block', fontSize: 9, letterSpacing: 1, padding: '3px 12px', border: '1px solid #1a6fff', color: '#1a6fff', textTransform: 'uppercase', marginTop: 8 },
  sintRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #141414' },
  sintLabel: { fontSize: 9, color: '#555' },
  loading: { padding: '40px 32px', fontSize: 12, color: '#aaa' },
  error: { padding: '40px 32px', color: '#cc0000', fontSize: 12 },
}

const encLabel = {
  observacao: 'Observação',
  auxilio_clinico: 'Auxílio Clínico',
  medicacao: 'Encaminhamento Prioritário',
}

const SINTOMAS_LABELS = [
  { id: 'sin_atraso_fala',            label: 'Atraso na fala' },
  { id: 'sin_dif_aprendizado',        label: 'Dif. aprendizado' },
  { id: 'sin_deficit_atencao',        label: 'Déficit de atenção' },
  { id: 'sin_def_intelectual',        label: 'Def. intelectual' },
  { id: 'sin_hiperatividade',         label: 'Hiperatividade' },
  { id: 'sin_agressividade',          label: 'Agressividade' },
  { id: 'sin_evita_contato_visual',   label: 'Ev. contato visual' },
  { id: 'sin_evita_contato_fisico',   label: 'Ev. contato físico' },
  { id: 'sin_movimentos_repetitivos', label: 'Mov. repetitivos' },
  { id: 'sin_frouxidao',              label: 'Frouxidão' },
  { id: 'sin_macroquidia',            label: 'Macroquidia' },
  { id: 'sin_face_alongada',          label: 'Face alongada' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function Laudo() {
  const navigate = useNavigate()
  const { consulta_id } = useParams()
  const [dados, setDados] = useState(null)
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get(`/laudos/${consulta_id}`)
      .then(r => setDados(r.data))
      .catch(() => setErro('Erro ao carregar dados do laudo.'))
      .finally(() => setLoading(false))
  }, [consulta_id])

  useEffect(() => {
    const pacienteId = dados?.paciente?.id
    if (!pacienteId) return
    api.get(`/relatorios/historico/${pacienteId}`)
      .then(r => setHistorico(r.data))
      .catch(() => setHistorico([]))
  }, [dados])

  // acompanhamento: cria uma nova consulta para o mesmo paciente e abre o
  // checklist — a nova avaliacao entra no grafico de evolucao do score
  async function novaAvaliacao() {
    try {
      const hoje = new Date().toISOString().split('T')[0]
      const { data } = await api.post('/consultas', {
        paciente_id: dados.paciente.id,
        data_consulta: hoje,
        observacoes: 'Reavaliação de acompanhamento',
      })
      navigate(`/checklist?consulta_id=${data.consulta_id}`)
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao criar nova avaliação.')
    }
  }

  async function downloadPdf() {
    try {
      const response = await api.get(`/laudos/${consulta_id}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `laudo_consulta_${consulta_id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      alert('Erro ao baixar PDF.')
    }
  }

  if (loading) return <div style={s.loading}>Carregando laudo...</div>
  if (erro)    return <div style={s.error}>{erro}</div>
  if (!dados)  return null

  const { consulta, checklist, paciente, medico } = dados

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <div style={s.corner}></div>
        <div style={s.eye}>laudo de consulta #{consulta_id}</div>
        <div style={s.title}>Laudo Clínico</div>

        <div style={s.sectionTitle}>dados do paciente</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Avatar nome={paciente?.nome} foto={paciente?.foto} size={44} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a' }}>{paciente?.nome || '—'}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>{paciente?.sexo === 'F' ? 'Feminino' : paciente?.sexo === 'M' ? 'Masculino' : '—'}</div>
          </div>
        </div>
        <div style={s.row}><span style={s.rowLabel}>Nome</span><span style={s.rowVal}>{paciente?.nome || '—'}</span></div>
        <div style={s.row}><span style={s.rowLabel}>CPF</span><span style={s.rowVal}>{paciente?.cpf || '—'}</span></div>
        <div style={s.row}><span style={s.rowLabel}>Data de nascimento</span><span style={s.rowVal}>{formatDate(paciente?.data_nascimento)}</span></div>
        <div style={s.row}><span style={s.rowLabel}>Cidade / Estado</span><span style={s.rowVal}>{paciente?.cidade} — {paciente?.estado}</span></div>
        <div style={s.row}><span style={s.rowLabel}>Responsável</span><span style={s.rowVal}>{paciente?.nome_responsavel || '—'}</span></div>

        <div style={s.sectionTitle}>dados da consulta</div>
        <div style={s.row}>
          <span style={s.rowLabel}>Médico responsável</span>
          <span style={{ ...s.rowVal, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar nome={medico?.nome} foto={medico?.foto} size={20} />
            {medico?.nome || '—'}
          </span>
        </div>
        <div style={s.row}><span style={s.rowLabel}>CRM</span><span style={s.rowVal}>{medico?.crm || '—'}</span></div>
        <div style={s.row}><span style={s.rowLabel}>Especialidade</span><span style={s.rowVal}>{medico?.especialidade || '—'}</span></div>
        <div style={s.row}><span style={s.rowLabel}>Data da consulta</span><span style={s.rowVal}>{formatDate(consulta?.data_consulta)}</span></div>
        <div style={s.row}><span style={s.rowLabel}>Status</span><span style={s.rowVal}>{consulta?.status || '—'}</span></div>

        {checklist?.observacoes && (
          <>
            <div style={s.sectionTitle}>observações</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>{checklist.observacoes}</div>
          </>
        )}

        {historico.length > 1 && (
          <>
            <div style={s.sectionTitle}>evolução do score ponderado</div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={historico.map(h => ({
                  data: formatDate(h.data_consulta),
                  score_ponderado: Number(h.score_ponderado),
                  limiar: Number(h.limiar_usado),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="data" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <ReferenceLine y={Number(checklist?.limiar_usado)} stroke="#cc0000" strokeDasharray="4 4" label={{ value: 'limiar', fontSize: 9, fill: '#cc0000' }} />
                  <Line type="monotone" dataKey="score_ponderado" stroke="#1a6fff" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        <div style={s.footer}>
          <button style={s.btnBack} onClick={() => navigate('/home')}>← Voltar</button>
          <button style={s.btnPdf} onClick={downloadPdf}>
            Baixar PDF
            <div style={s.btnBar}></div>
          </button>
          <button
            style={{ ...s.btnPdf, background: '#1a6fff' }}
            title="Cria uma nova consulta de acompanhamento e abre o checklist"
            onClick={novaAvaliacao}
          >
            Nova Avaliação →
            <div style={{ ...s.btnBar, background: '#0a0a0a' }}></div>
          </button>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.reye}>resultado</div>
        <div style={s.rtitle}>Avaliação</div>

        {checklist ? (
          <>
            <div style={{ textAlign: 'center', padding: '14px 0', borderBottom: '1px solid #141414' }}>
              <div style={s.score}>{checklist.score_total}/12</div>
              <div style={s.scoreLabel}>score total</div>
              {checklist.score_ponderado !== undefined && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 18, color: '#fff', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
                    {Number(checklist.score_ponderado).toFixed(4)}
                  </div>
                  <div style={s.scoreLabel}>score ponderado (limiar {Number(checklist.limiar_usado).toFixed(2)})</div>
                  <div style={{ position: 'relative', background: '#1a1a1a', height: 8, borderRadius: 4, marginTop: 8 }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      width: `${Math.min(Number(checklist.score_ponderado) * 100, 100)}%`,
                      background: checklist.score_ponderado >= checklist.limiar_usado ? '#e02020' : '#1a6fff',
                    }}></div>
                    <div style={{
                      position: 'absolute', top: -3, bottom: -3, width: 2, background: '#fff',
                      left: `${Math.min(Number(checklist.limiar_usado) * 100, 100)}%`,
                    }}></div>
                  </div>
                </div>
              )}
              <div style={s.encTag}>{encLabel[checklist.encaminhamento] || checklist.encaminhamento}</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ ...s.reye, marginBottom: 8 }}>sintomas marcados</div>
              {SINTOMAS_LABELS.map(s2 => (
                <div key={s2.id} style={s.sintRow}>
                  <span style={s.sintLabel}>{s2.label}</span>
                  <span style={{ fontSize: 10, color: checklist[s2.id] ? '#1a6fff' : '#555' }}>
                    {checklist[s2.id] ? '✓' : '—'}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>
            Checklist ainda não preenchido.
          </div>
        )}
      </div>
    </div>
  )
}