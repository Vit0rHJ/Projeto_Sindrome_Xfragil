import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cadastrarPaciente } from '../services/api';

const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const EMPTY = {
  nome: '', cpf: '', data_nascimento: '', sexo: '',
  nome_mae: '', nome_pai: '',
  nome_responsavel: '', cpf_responsavel: '',
  telefone_responsavel: '', grau_parentesco: '',
  email: '', telefone: '', whatsapp: '', telefone2: '',
  cidade: '', estado: '', pais: 'Brasil',
  ja_fez_exame_dna: 0, interesse_exame_pcr: 0, resultado_exame: null,
  diagnostico_autismo: 0, tem_irmaos: 0,
  historico_familiar_di: 'nao', historico_menopausa: 'nao', historico_ataxia: 'nao',
};

export default function CadastroPaciente() {
  const navigate = useNavigate();
  const [form, setForm]     = useState(EMPTY);
  const [erro, setErro]     = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(''); setSucesso('');
    if (!form.nome || !form.cpf || !form.nome_responsavel || !form.cpf_responsavel || !form.telefone_responsavel) {
      setErro('Preencha os campos obrigatórios (*).');
      return;
    }
    setLoading(true);
    try {
      await cadastrarPaciente(form);
      setSucesso('Paciente cadastrado com sucesso!');
      setTimeout(() => navigate('/pacientes'), 1500);
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
          <h2>Cadastrar Paciente</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>Preencha os dados do paciente para cadastro no sistema</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/pacientes')}>← Voltar</button>
      </div>

      {erro    && <div className="alert alert-error">{erro}</div>}
      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      <form onSubmit={handleSubmit}>
        {/* Dados pessoais */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="section-title">Dados Pessoais</div>
          <div className="form-row">
            <div className="form-group">
              <label>Nome completo *</label>
              <input value={form.nome} onChange={e => set('nome', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>CPF *</label>
              <input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Sexo Biológico</label>
              <select value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Nome da Mãe</label>
              <input value={form.nome_mae} onChange={e => set('nome_mae', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nome do Pai</label>
              <input value={form.nome_pai} onChange={e => set('nome_pai', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Responsável */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="section-title">Responsável</div>
          <div className="form-row">
            <div className="form-group">
              <label>Nome do Responsável *</label>
              <input value={form.nome_responsavel} onChange={e => set('nome_responsavel', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>CPF do Responsável *</label>
              <input value={form.cpf_responsavel} onChange={e => set('cpf_responsavel', e.target.value)} placeholder="000.000.000-00" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Telefone do Responsável *</label>
              <input value={form.telefone_responsavel} onChange={e => set('telefone_responsavel', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Grau de Parentesco</label>
              <select value={form.grau_parentesco} onChange={e => set('grau_parentesco', e.target.value)}>
                <option value="">Selecione</option>
                {['Mãe','Pai','Avó/Avô','Tia/Tio','Irmã/Irmão','Outro'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="section-title">Contato e Localização</div>
          <div className="form-row">
            <div className="form-group">
              <label>WhatsApp</label>
              <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Telefone 2</label>
              <input value={form.telefone2} onChange={e => set('telefone2', e.target.value)} />
            </div>
            <div className="form-group"></div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label>Cidade</label>
              <input value={form.cidade} onChange={e => set('cidade', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)}>
                <option value="">UF</option>
                {ESTADOS_BR.map(uf => <option key={uf}>{uf}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>País</label>
              <input value={form.pais} onChange={e => set('pais', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Histórico clínico */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="section-title">Histórico Clínico</div>

          {[
            { label: 'Já fez exame de DNA? (PCR)', k: 'ja_fez_exame_dna' },
            { label: 'Tem interesse em fazer exame de DNA?', k: 'interesse_exame_pcr' },
            { label: 'Diagnóstico de autismo (TEA)?', k: 'diagnostico_autismo' },
            { label: 'Tem irmãos?', k: 'tem_irmaos' },
          ].map(({ label, k }) => (
            <div className="form-group" key={k}>
              <label>{label}</label>
              <div className="radio-group">
                <label><input type="radio" name={k} checked={form[k]===1||form[k]==='1'} onChange={() => set(k, 1)} style={{ width:'auto' }} /> Sim</label>
                <label><input type="radio" name={k} checked={form[k]===0||form[k]==='0'} onChange={() => set(k, 0)} style={{ width:'auto' }} /> Não</label>
              </div>
            </div>
          ))}

          <div className="form-group">
            <label>Resultado do exame (se já realizou)</label>
            <select value={form.resultado_exame || ''} onChange={e => set('resultado_exame', e.target.value || null)}>
              <option value="">— Não aplicável</option>
              <option value="Mutação Completa (mais de 200 repetições)">Mutação Completa (+200 repetições)</option>
              <option value="Pré-mutação (55 a 200 repetições)">Pré-mutação (55–200 repetições)</option>
              <option value="Negativo (até 54 repetições)">Negativo (até 54 repetições)</option>
            </select>
          </div>

          {[
            { label: 'Histórico familiar de deficiência intelectual / atraso na fala?', k: 'historico_familiar_di' },
            { label: 'Parente feminina com menopausa precoce?', k: 'historico_menopausa' },
            { label: 'Parente masculino com ataxia ou tremor?', k: 'historico_ataxia' },
          ].map(({ label, k }) => (
            <div className="form-group" key={k}>
              <label>{label}</label>
              <div className="radio-group">
                {['sim','nao','nao_sei'].map(v => (
                  <label key={v}><input type="radio" name={k} value={v} checked={form[k]===v} onChange={e => set(k, e.target.value)} style={{ width:'auto' }} /> {v==='sim'?'Sim':v==='nao'?'Não':'Não sei'}</label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/pacientes')}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Cadastrar Paciente'}
          </button>
        </div>
      </form>
    </div>
  );
}
