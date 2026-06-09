import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarMedicos, listarPacientes, listarConsultas, cadastrarMedico } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// ── Ícones ────────────────────────────────────────────────────────────────────
const IconUsers    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCalendar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconSteth    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>;
const IconCheck    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg>;
const IconPlus     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

const EMPTY_MEDICO = { nome: '', email: '', senha: '', crm: '', especialidade: '' };

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [medicos,   setMedicos]   = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [aba, setAba] = useState('visao-geral'); // 'visao-geral' | 'medicos' | 'consultas' | 'pacientes'

  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_MEDICO);
  const [saving,   setSaving]   = useState(false);
  const [erro,     setErro]     = useState('');
  const [sucesso,  setSucesso]  = useState('');

  const [buscaMedico,   setBuscaMedico]   = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const [m, p, c] = await Promise.all([listarMedicos(), listarPacientes(), listarConsultas()]);
      setMedicos(m);
      setPacientes(p);
      setConsultas(c);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleCadastrarMedico = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha || !form.crm || !form.especialidade) {
      setErro('Todos os campos são obrigatórios.'); return;
    }
    setErro(''); setSucesso(''); setSaving(true);
    try {
      await cadastrarMedico(form);
      setSucesso('Médico(a) cadastrado(a) com sucesso!');
      setForm(EMPTY_MEDICO);
      setShowForm(false);
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Métricas ────────────────────────────────────────────────────────────────
  const totalConsultas  = consultas.length;
  const realizadas      = consultas.filter(c => c.status === 'realizada').length;
  const pendentes       = consultas.filter(c => c.status === 'pendente').length;
  const comChecklist    = consultas.filter(c => c.tem_checklist).length;
  const altaSuspeita    = consultas.filter(c => c.score_total >= 8).length;

  // Consultas por médico (para o ranking)
  const consultasPorMedico = medicos.map(m => ({
    ...m,
    total: consultas.filter(c => c.medico_id === m.id).length,
    realizadas: consultas.filter(c => c.medico_id === m.id && c.status === 'realizada').length,
  })).sort((a, b) => b.total - a.total);

  const medicosFiltrados   = medicos.filter(m => m.nome?.toLowerCase().includes(buscaMedico.toLowerCase()) || m.crm?.includes(buscaMedico));
  const pacientesFiltrados = pacientes.filter(p => p.nome?.toLowerCase().includes(buscaPaciente.toLowerCase()) || p.cpf?.includes(buscaPaciente));

  const ABAS = [
    { id: 'visao-geral', label: 'Visão Geral' },
    { id: 'medicos',     label: `Médicos (${medicos.length})` },
    { id: 'consultas',   label: `Consultas (${totalConsultas})` },
    { id: 'pacientes',   label: `Pacientes (${pacientes.length})` },
  ];

  if (loading) return <div className="loading-wrap"><div className="spinner"></div><p>Carregando painel...</p></div>;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h2>Painel do Administrador</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>
            Olá, {user?.nome} — visão completa do sistema
          </p>
        </div>
      </div>

      {erro    && <div className="alert alert-error">{erro}</div>}
      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      {/* Abas */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {ABAS.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            style={{
              padding: '9px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500,
              color: aba === a.id ? 'var(--blue)' : 'var(--text-muted)',
              borderBottom: aba === a.id ? '2px solid var(--blue)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ── ABA: VISÃO GERAL ─────────────────────────────────────────────────── */}
      {aba === 'visao-geral' && (
        <div>
          {/* Cards de métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            {[
              { icon: <IconSteth />,    label: 'Médicos',        val: medicos.length,   color: 'var(--blue)',    bg: 'var(--blue-light)' },
              { icon: <IconUsers />,    label: 'Pacientes',      val: pacientes.length, color: 'var(--teal)',    bg: 'var(--teal-light)' },
              { icon: <IconCalendar />, label: 'Consultas',      val: totalConsultas,   color: '#7c3aed',        bg: '#ede9fe' },
              { icon: <IconCheck />,    label: 'Realizadas',     val: realizadas,       color: 'var(--teal)',    bg: 'var(--teal-light)' },
              { icon: <IconCalendar />, label: 'Pendentes',      val: pendentes,        color: '#856404',        bg: 'var(--warn-bg)' },
              { icon: <IconCheck />,    label: 'Alta suspeita',  val: altaSuspeita,     color: 'var(--danger)',  bg: '#fce8e8' },
            ].map(({ icon, label, val, color, bg }) => (
              <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  {icon}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Lora, serif', color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Ranking de médicos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <div className="section-title">Consultas por médico</div>
              {consultasPorMedico.length === 0
                ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhum médico cadastrado.</p>
                : consultasPorMedico.map((m, i) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < consultasPorMedico.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                      {m.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.especialidade}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--blue)' }}>{m.total}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.realizadas} realizadas</div>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Últimas consultas */}
            <div className="card">
              <div className="section-title">Últimas consultas</div>
              {consultas.slice(0, 6).map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                  onClick={() => c.tem_checklist && navigate(`/laudo/${c.id}`)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.paciente_nome || `Paciente #${c.paciente_id}`}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.medico_nome || '—'} · {c.data_consulta ? new Date(c.data_consulta).toLocaleDateString('pt-BR') : '—'}</div>
                  </div>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </div>
              ))}
              {consultas.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhuma consulta ainda.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: MÉDICOS ─────────────────────────────────────────────────────── */}
      {aba === 'medicos' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input placeholder="Buscar por nome ou CRM..." value={buscaMedico} onChange={e => setBuscaMedico(e.target.value)} style={{ maxWidth: 320 }} />
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => { setShowForm(!showForm); setErro(''); setSucesso(''); }}>
              <IconPlus /> {showForm ? 'Cancelar' : 'Cadastrar Médico'}
            </button>
          </div>

          {showForm && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">Novo médico</div>
              <form onSubmit={handleCadastrarMedico}>
                <div className="form-row">
                  <div className="form-group"><label>Nome *</label><input value={form.nome} onChange={e => setF('nome', e.target.value)} /></div>
                  <div className="form-group"><label>E-mail *</label><input type="email" value={form.email} onChange={e => setF('email', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Senha provisória *</label><input type="password" value={form.senha} onChange={e => setF('senha', e.target.value)} /></div>
                  <div className="form-group"><label>CRM *</label><input value={form.crm} onChange={e => setF('crm', e.target.value)} placeholder="CRM/PR 00000" /></div>
                </div>
                <div className="form-group">
                  <label>Especialidade *</label>
                  <input value={form.especialidade} onChange={e => setF('especialidade', e.target.value)} placeholder="Ex: Neuropediatria, Genética Médica..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar'}</button>
                </div>
              </form>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>CRM</th>
                    <th>Especialidade</th>
                    <th>Consultas</th>
                    <th>Cadastrado em</th>
                  </tr>
                </thead>
                <tbody>
                  {medicosFiltrados.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum médico encontrado.</td></tr>
                  ) : medicosFiltrados.map(m => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                            {m.nome?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{m.nome}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{m.email}</td>
                      <td style={{ fontSize: 13 }}>{m.crm}</td>
                      <td style={{ fontSize: 13 }}>{m.especialidade}</td>
                      <td style={{ fontSize: 13, textAlign: 'center' }}>
                        {consultas.filter(c => c.medico_id === m.id).length}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {m.criado_em ? new Date(m.criado_em).toLocaleDateString('pt-BR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: CONSULTAS ───────────────────────────────────────────────────── */}
      {aba === 'consultas' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {consultas.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhuma consulta registrada.</td></tr>
                ) : consultas.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.paciente_nome || `#${c.paciente_id}`}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.medico_nome || '—'}</td>
                    <td style={{ fontSize: 13 }}>{c.data_consulta ? new Date(c.data_consulta).toLocaleDateString('pt-BR') : '—'}</td>
                    <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                    <td>
                      {c.score_total != null ? (
                        <span style={{ fontWeight: 600, color: c.score_total >= 8 ? 'var(--danger)' : c.score_total >= 4 ? '#856404' : 'var(--teal)' }}>
                          {c.score_total}/12
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                    </td>
                    <td>
                      {c.tem_checklist && (
                        <button className="btn-secondary btn-sm" onClick={() => navigate(`/laudo/${c.id}`)}>Ver laudo</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ABA: PACIENTES ───────────────────────────────────────────────────── */}
      {aba === 'pacientes' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input placeholder="Buscar por nome ou CPF..." value={buscaPaciente} onChange={e => setBuscaPaciente(e.target.value)} style={{ maxWidth: 340 }} />
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/pacientes/novo')}>
              <IconPlus /> Cadastrar Paciente
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Nascimento</th>
                    <th>Cidade/UF</th>
                    <th>Médico vinculado</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum paciente encontrado.</td></tr>
                  ) : pacientesFiltrados.map(p => {
                    const medico = medicos.find(m => m.id === p.medico_id);
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.nome}</td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.cpf}</td>
                        <td style={{ fontSize: 13 }}>{p.data_nascimento ? new Date(p.data_nascimento).toLocaleDateString('pt-BR') : '—'}</td>
                        <td style={{ fontSize: 13 }}>{[p.cidade, p.estado].filter(Boolean).join('/') || '—'}</td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{medico?.nome || '—'}</td>
                        <td>
                          <button className="btn-secondary btn-sm"
                            onClick={() => navigate('/consultas/nova', { state: { paciente_id: p.id, paciente_nome: p.nome } })}>
                            Nova Consulta
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
