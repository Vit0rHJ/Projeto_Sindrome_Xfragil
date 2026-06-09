import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarPacientes } from '../services/api';

export default function Pacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busca, setBusca]         = useState('');
  const [erro, setErro]           = useState('');

  useEffect(() => {
    listarPacientes()
      .then(setPacientes)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = pacientes.filter(p =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    p.cpf?.includes(busca)
  );

  if (loading) return <div className="loading-wrap"><div className="spinner"></div><p>Carregando pacientes...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h2>Pacientes</h2>
        <button className="btn-primary" onClick={() => navigate('/pacientes/novo')}>
          + Cadastrar Paciente
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input placeholder="Buscar por nome ou CPF..." value={busca} onChange={e => setBusca(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Nascimento</th>
                <th>Cidade/UF</th>
                <th>Contato</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum paciente encontrado.</td></tr>
              ) : filtrados.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.nome}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.cpf}</td>
                  <td style={{ fontSize: 13 }}>{p.data_nascimento ? new Date(p.data_nascimento).toLocaleDateString('pt-BR') : '—'}</td>
                  <td style={{ fontSize: 13 }}>{[p.cidade, p.estado].filter(Boolean).join('/') || '—'}</td>
                  <td style={{ fontSize: 13 }}>{p.telefone || p.whatsapp || '—'}</td>
                  <td>
                    <button className="btn-secondary btn-sm" onClick={() => navigate('/consultas/nova', { state: { paciente_id: p.id, paciente_nome: p.nome } })}>
                      Nova Consulta
                    </button>
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
