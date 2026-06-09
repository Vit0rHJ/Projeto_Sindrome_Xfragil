import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarConsultas, atualizarStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, canViewAll } = useAuth();
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState('');
  const [filtro, setFiltro]       = useState('todos');

  const carregar = async () => {
    try {
      const data = await listarConsultas();
      setConsultas(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await atualizarStatus(id, status);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtradas = filtro === 'todos' ? consultas : consultas.filter(c => c.status === filtro);
  const contagem = {
    pendente:  consultas.filter(c => c.status === 'pendente').length,
    realizada: consultas.filter(c => c.status === 'realizada').length,
    cancelada: consultas.filter(c => c.status === 'cancelada').length,
  };

  if (loading) return <div className="loading-wrap"><div className="spinner"></div><p>Carregando consultas...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>
            Bem-vindo(a), {user?.nome}
            {canViewAll && <span style={{ marginLeft: 8, padding: '2px 8px', background: 'var(--blue-light)', color: 'var(--blue)', borderRadius: 12, fontSize: 12 }}>visão geral</span>}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/consultas/nova')}>
          + Nova Consulta
        </button>
      </div>

      {/* Cards de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', val: consultas.length, color: 'var(--blue)' },
          { label: 'Pendentes', val: contagem.pendente, color: '#856404' },
          { label: 'Realizadas', val: contagem.realizada, color: 'var(--teal)' },
          { label: 'Canceladas', val: contagem.cancelada, color: 'var(--danger)' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color, fontFamily: 'Lora, serif' }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        {['todos','pendente','realizada','cancelada'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid var(--border)', background: filtro === f ? 'var(--blue)' : 'var(--white)', color: filtro === f ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13, textTransform: 'capitalize' }}>
            {f === 'todos' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Paciente</th>
                {canViewAll && <th>Médico</th>}
                <th>Data</th>
                <th>Status</th>
                <th>Checklist</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={canViewAll ? 7 : 6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhuma consulta encontrada.</td></tr>
              ) : filtradas.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.id}</td>
                  <td style={{ fontWeight: 500 }}>{c.paciente_nome || '—'}</td>
                  {canViewAll && <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.medico_nome || '—'}</td>}
                  <td style={{ fontSize: 13 }}>{c.data_consulta ? new Date(c.data_consulta).toLocaleDateString('pt-BR') : '—'}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td>
                    {c.tem_checklist ? (
                      <span style={{ color: 'var(--teal)', fontSize: 13, fontWeight: 500 }}>✓ Preenchido</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>— Pendente</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {!c.tem_checklist && c.status === 'pendente' && (
                        <button className="btn-primary btn-sm" onClick={() => navigate(`/checklist/${c.id}`)}>
                          Checklist
                        </button>
                      )}
                      {c.tem_checklist && (
                        <button className="btn-secondary btn-sm" onClick={() => navigate(`/laudo/${c.id}`)}>
                          Laudo
                        </button>
                      )}
                      {c.status === 'pendente' && (
                        <button className="btn-sm" style={{ background: 'var(--teal-light)', color: 'var(--teal)', border: '1px solid #9fe1cb' }}
                          onClick={() => handleStatus(c.id, 'realizada')}>
                          Concluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
