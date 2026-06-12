import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Avatar from '../components/Avatar'

const s = {
  wrap: { padding: '28px 32px', overflow: 'auto', height: 'calc(100vh - 62px)', background: '#fff' },
  eye: { fontSize: 8, letterSpacing: 4, textTransform: 'uppercase', color: '#1a6fff', marginBottom: 5 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 2, color: '#0a0a0a', lineHeight: 1, marginBottom: 4 },
  sub: { fontSize: 10, color: '#999', letterSpacing: 1, marginBottom: 24 },
  tbl: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: 8, letterSpacing: 2, color: '#ccc', textTransform: 'uppercase', textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid #e8e8e8', background: '#fafafa' },
  td: { fontSize: 11, color: '#555', padding: '9px 10px', borderBottom: '1px solid #f0f0f0' },
  av: { display: 'flex', alignItems: 'center', gap: 8 },
  avc: { width: 26, height: 26, borderRadius: '50%', background: '#0d1a33', border: '1px solid #1a6fff22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#1a6fff', flexShrink: 0 },
  bd: { display: 'inline-block', fontSize: 8, letterSpacing: 1, padding: '2px 8px', color: '#20c850', border: '1px solid #20c850' },
  bp: { display: 'inline-block', fontSize: 8, letterSpacing: 1, padding: '2px 8px', color: '#e8a020', border: '1px solid #e8a020' },
}

const encBadge = {
  observacao:      { label: 'Observação',     color: '#1a6fff' },
  auxilio_clinico: { label: 'Auxílio Clínico', color: '#e8a020' },
  medicacao:       { label: 'Prioritário',     color: '#e02020' },
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function Laudos() {
  const navigate = useNavigate()
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/consultas')
      // so tem laudo quem ja tem checklist preenchido (encaminhamento vem da view)
      .then(r => setConsultas(r.data.filter(c => c.encaminhamento)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={s.wrap}>
      <div style={s.eye}>laudos clínicos</div>
      <div style={s.title}>Laudos</div>
      <div style={s.sub}>Consultas com checklist preenchido</div>

      {loading ? (
        <div style={{ fontSize: 12, color: '#aaa' }}>Carregando...</div>
      ) : (
        <table style={s.tbl}>
          <thead>
            <tr>
              <th style={s.th}>Paciente</th>
              <th style={s.th}>Médico</th>
              <th style={s.th}>Data</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Resultado</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {consultas.length === 0 ? (
              <tr><td style={{ ...s.td, color: '#bbb', fontStyle: 'italic' }} colSpan={6}>Nenhuma consulta com checklist preenchido</td></tr>
            ) : (
              consultas.map(c => (
                <tr key={c.id}>
                  <td style={s.td}>
                    <div style={s.av}>
                      <Avatar nome={c.paciente_nome} foto={c.paciente_foto} />
                      {c.paciente_nome}
                    </div>
                  </td>
                  <td style={s.td}>{c.medico_nome || '—'}</td>
                  <td style={s.td}>{formatDate(c.data_consulta)}</td>
                  <td style={s.td}>
                    <span style={c.status === 'realizada' ? s.bd : s.bp}>{c.status}</span>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      display: 'inline-block', fontSize: 8, letterSpacing: 1, padding: '2px 8px',
                      color: encBadge[c.encaminhamento]?.color || '#888',
                      border: `1px solid ${encBadge[c.encaminhamento]?.color || '#888'}`,
                    }}>
                      {encBadge[c.encaminhamento]?.label || c.encaminhamento}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: '#1a6fff', cursor: 'pointer', fontSize: 10, letterSpacing: 1 }}
                    onClick={() => navigate(`/laudo/${c.id}`)}>
                    Ver laudo →
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}