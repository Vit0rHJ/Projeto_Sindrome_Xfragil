import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { listarPacientes, criarConsulta } from '../services/api';

export default function NovaConsulta() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const preSelect = location.state;

  const [pacientes, setPacientes]   = useState([]);
  const [pacienteId, setPacienteId] = useState(preSelect?.paciente_id || '');
  const [data, setData]             = useState('');
  const [obs, setObs]               = useState('');
  const [erro, setErro]             = useState('');
  const [loading, setLoading]       = useState(false);
  const [loadingP, setLoadingP]     = useState(true);

  useEffect(() => {
    listarPacientes()
      .then(setPacientes)
      .catch(e => setErro(e.message))
      .finally(() => setLoadingP(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pacienteId || !data) { setErro('Selecione um paciente e a data da consulta.'); return; }
    setErro(''); setLoading(true);
    try {
      const res = await criarConsulta({ paciente_id: pacienteId, data_consulta: data, observacoes: obs });
      navigate(`/checklist/${res.consulta_id}`);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Nova Consulta</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>Selecione o paciente e registre a data da consulta</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>← Voltar</button>
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Paciente *</label>
            {loadingP ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Carregando pacientes...</p> : (
              <select value={pacienteId} onChange={e => setPacienteId(e.target.value)} required>
                <option value="">— Selecione um paciente —</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome} — {p.cpf}</option>)}
              </select>
            )}
          </div>

          <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            <button type="button" className="btn-secondary btn-sm" onClick={() => navigate('/pacientes/novo')}>
              + Cadastrar novo paciente
            </button>
          </div>

          <div className="form-group">
            <label>Data da Consulta *</label>
            <input type="datetime-local" value={data} onChange={e => setData(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3} placeholder="Informações adicionais sobre a consulta..." />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Criando...' : 'Criar e abrir checklist →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
