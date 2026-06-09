import React, { useEffect, useState } from 'react';
import { listarMedicos, cadastrarMedico } from '../services/api';

export default function Medicos() {
  const [medicos, setMedicos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ nome:'', email:'', senha:'', crm:'', especialidade:'' });
  const [erro, setErro]         = useState('');
  const [sucesso, setSucesso]   = useState('');
  const [saving, setSaving]     = useState(false);

  const carregar = () => {
    listarMedicos().then(setMedicos).catch(e => setErro(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha || !form.crm || !form.especialidade) {
      setErro('Todos os campos são obrigatórios.'); return;
    }
    setErro(''); setSucesso(''); setSaving(true);
    try {
      await cadastrarMedico(form);
      setSucesso('Médico(a) cadastrado(a) com sucesso!');
      setForm({ nome:'', email:'', senha:'', crm:'', especialidade:'' });
      setShowForm(false);
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Médicos Cadastrados</h2>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setErro(''); setSucesso(''); }}>
          {showForm ? '✕ Cancelar' : '+ Cadastrar Médico'}
        </button>
      </div>

      {erro    && <div className="alert alert-error">{erro}</div>}
      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">Novo Médico</div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Nome *</label><input value={form.nome} onChange={e => set('nome', e.target.value)} /></div>
              <div className="form-group"><label>E-mail *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Senha provisória *</label><input type="password" value={form.senha} onChange={e => set('senha', e.target.value)} /></div>
              <div className="form-group"><label>CRM *</label><input value={form.crm} onChange={e => set('crm', e.target.value)} placeholder="CRM/PR 00000" /></div>
            </div>
            <div className="form-group">
              <label>Especialidade *</label>
              <input value={form.especialidade} onChange={e => set('especialidade', e.target.value)} placeholder="Ex: Neuropediatria, Genética Médica..." />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-wrap"><div className="spinner"></div></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>CRM</th>
                  <th>Especialidade</th>
                  <th>Cadastrado em</th>
                </tr>
              </thead>
              <tbody>
                {medicos.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:'2rem' }}>Nenhum médico cadastrado.</td></tr>
                ) : medicos.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>{m.nome}</td>
                    <td style={{ fontSize: 13 }}>{m.email}</td>
                    <td style={{ fontSize: 13 }}>{m.crm}</td>
                    <td style={{ fontSize: 13 }}>{m.especialidade}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.criado_em ? new Date(m.criado_em).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
