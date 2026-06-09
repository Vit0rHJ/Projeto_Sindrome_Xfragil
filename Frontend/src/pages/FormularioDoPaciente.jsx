import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INITIAL = {
  nome: '', cpf: '', data_nascimento: '', sexo: '',
  nome_mae: '', nome_pai: '', nome_responsavel: '', cpf_responsavel: '',
  grau_parentesco: '', telefone_responsavel: '',
  whatsapp: '', telefone: '', telefone2: '', email: '',
  cidade: '', estado: '', pais: 'Brasil',
  ja_fez_exame_dna: '', interesse_exame_pcr: '', resultado_exame: '',
  diagnostico_autismo: '', tem_irmaos: '',
  historico_familiar_di: '', historico_menopausa: '', historico_ataxia: '',
  // sintomas presentes
  sin_atraso_fala: false, sin_dif_aprendizado: false, sin_deficit_atencao: false,
  sin_def_intelectual: false, sin_hiperatividade: false, sin_agressividade: false,
  sin_evita_contato_visual: false, sin_evita_contato_fisico: false,
  sin_movimentos_repetitivos: false, sin_frouxidao: false,
  sin_macroquidia: false, sin_face_alongada: false,
  termos: false,
};

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function FormularioPacientePublico() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro]   = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggle = (k) => setForm(prev => ({ ...prev, [k]: !prev[k] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.termos) { setErro('Você precisa aceitar os termos para enviar.'); return; }
    if (!form.nome || !form.cpf || !form.nome_responsavel || !form.cpf_responsavel || !form.telefone_responsavel) {
      setErro('Preencha todos os campos obrigatórios (marcados com *).'); return;
    }
    setErro('');
    setLoading(true);

    // Este formulário público envia para uma rota aberta do back que registra o interesse
    // A rota /api/triagem/publica pode ser criada no back para receber sem autenticação
    try {
      const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${BASE}/triagem/publica`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSucesso(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErro(data.mensagem || 'Erro ao enviar. Tente novamente.');
      }
    } catch {
      setErro('Não foi possível conectar ao servidor. Tente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) return (
    <div className="public-page">
      <div className="public-hero"><h1>Formulário Enviado!</h1></div>
      <div className="public-body" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <div className="alert alert-success" style={{ fontSize: 16, padding: '1.5rem', borderRadius: 10 }}>
          ✓ Seu formulário foi recebido com sucesso. Um profissional de saúde entrará em contato em breve.
        </div>
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
          Voltar à página inicial
        </button>
      </div>
    </div>
  );

  return (
    <div className="public-page">
      <div className="public-hero">
        <h1>Cadastro Eu Digo X</h1>
        <p>Preencha o cadastro abaixo</p>
      </div>

      <div className="public-body">
        <div className="contact-bar">
          Por favor, responda o formulário abaixo. Em caso de dúvidas entre em contato pelo e-mail: <strong>contato@institutoxfragil.org.br</strong> ou ligue: <strong>41 3156-0509</strong>
        </div>

        {erro && <div className="alert alert-error">{erro}</div>}

        <form onSubmit={handleSubmit} className="card">
          {/* DADOS PESSOAIS */}
          <div className="section-title">Dados Pessoais</div>
          <div className="form-row">
            <div className="form-group">
              <label>Nome do Paciente *</label>
              <input value={form.nome} onChange={e => set('nome', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Sexo Biológico</label>
            <div className="radio-group">
              {['Masculino','Feminino'].map(s => (
                <label key={s}><input type="radio" name="sexo" value={s} checked={form.sexo===s} onChange={e => set('sexo', e.target.value)} /> {s}</label>
              ))}
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

          <div className="form-group">
            <label>Responsável pelo Paciente *</label>
            <input value={form.nome_responsavel} onChange={e => set('nome_responsavel', e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Grau de parentesco com o paciente *</label>
              <select value={form.grau_parentesco} onChange={e => set('grau_parentesco', e.target.value)}>
                <option value="">Selecione</option>
                {['Mãe','Pai','Avó/Avô','Tia/Tio','Irmã/Irmão','Outro'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>CPF do responsável *</label>
              <input value={form.cpf_responsavel} onChange={e => set('cpf_responsavel', e.target.value)} placeholder="000.000.000-00" required />
            </div>
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

          {/* FORMAS DE CONTATO */}
          <div className="section-title" style={{ marginTop: '1.5rem' }}>Formas de Contato</div>
          <div className="form-row">
            <div className="form-group">
              <label>WhatsApp</label>
              <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="(41) 9 0000-0000" />
            </div>
            <div className="form-group">
              <label>Telefone para Ligações *</label>
              <input value={form.telefone_responsavel} onChange={e => set('telefone_responsavel', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Telefone 2</label>
              <input value={form.telefone2} onChange={e => set('telefone2', e.target.value)} />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>

          {/* QUESTIONÁRIO */}
          <div className="section-title" style={{ marginTop: '1.5rem' }}>Questionário</div>

          {[
            { q: 'Já teve interesse em fazer o exame de DNA para o paciente? (PCR)', k1: 'ja_fez_exame_dna', k2: null, opts: ['Sim','Não'] },
            { q: 'Tem interesse em fazer o exame do DNA para o paciente? (PCR)', k1: 'interesse_exame_pcr', k2: null, opts: ['Sim','Não'] },
          ].map(({ q, k1, opts }) => (
            <div className="form-group" key={k1}>
              <label>{q}</label>
              <div className="radio-group">
                {opts.map(o => (
                  <label key={o}><input type="radio" name={k1} value={o==='Sim'?'1':'0'} checked={form[k1]===(o==='Sim'?'1':'0')} onChange={e => set(k1, e.target.value)} /> {o}</label>
                ))}
              </div>
            </div>
          ))}

          <div className="form-group">
            <label>Qual o resultado do exame? (se já realizou)</label>
            <select value={form.resultado_exame} onChange={e => set('resultado_exame', e.target.value)}>
              <option value="">Selecione</option>
              <option value="Mutação Completa (mais de 200 repetições)">Mutação Completa (mais de 200 repetições)</option>
              <option value="Pré-mutação (55 a 200 repetições)">Pré-mutação (55 a 200 repetições)</option>
              <option value="Negativo (até 54 repetições)">Negativo (até 54 repetições)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Possui diagnóstico de autismo? (TEA)</label>
            <div className="radio-group">
              <label><input type="radio" name="diag_autismo" value="1" checked={form.diagnostico_autismo==='1'} onChange={e => set('diagnostico_autismo', e.target.value)} /> Sim</label>
              <label><input type="radio" name="diag_autismo" value="0" checked={form.diagnostico_autismo==='0'} onChange={e => set('diagnostico_autismo', e.target.value)} /> Não</label>
            </div>
          </div>

          <div className="form-group">
            <label>Tem Irmãos?</label>
            <div className="radio-group">
              <label><input type="radio" name="irmaos" value="1" checked={form.tem_irmaos==='1'} onChange={e => set('tem_irmaos', e.target.value)} /> Sim</label>
              <label><input type="radio" name="irmaos" value="0" checked={form.tem_irmaos==='0'} onChange={e => set('tem_irmaos', e.target.value)} /> Não</label>
            </div>
          </div>

          {[
            { label: 'Há alguém na família com deficiência intelectual, atraso na fala, dificuldades de aprendizado que o senhor(a) conhece?', k: 'historico_familiar_di' },
            { label: 'Há alguma parente do sexo feminino com histórico de menopausa precoce?', k: 'historico_menopausa' },
            { label: 'Há alguma parente do sexo masculino com histórico de doença semelhante a ataxia ou tremor?', k: 'historico_ataxia' },
          ].map(({ label, k }) => (
            <div className="form-group" key={k}>
              <label>{label}</label>
              <div className="radio-group">
                <label><input type="radio" name={k} value="sim" checked={form[k]==='sim'} onChange={e => set(k, e.target.value)} /> Sim</label>
                <label><input type="radio" name={k} value="nao" checked={form[k]==='nao'} onChange={e => set(k, e.target.value)} /> Não</label>
                <label><input type="radio" name={k} value="nao_sei" checked={form[k]==='nao_sei'} onChange={e => set(k, e.target.value)} /> Não sei</label>
              </div>
            </div>
          ))}

          {/* SINTOMAS */}
          <div className="section-title" style={{ marginTop: '1.5rem' }}>Sintomas Observados no Paciente</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1rem' }}>Marque todos os sintomas que você observa no paciente:</p>
          <div className="checkbox-grid">
            {[
              { k: 'sin_atraso_fala',            label: 'Atraso na fala' },
              { k: 'sin_dif_aprendizado',         label: 'Dificuldade de aprendizado' },
              { k: 'sin_deficit_atencao',         label: 'Déficit de atenção' },
              { k: 'sin_def_intelectual',         label: 'Deficiência intelectual' },
              { k: 'sin_hiperatividade',          label: 'Hiperatividade' },
              { k: 'sin_agressividade',           label: 'Agressividade fora do normal' },
              { k: 'sin_evita_contato_visual',    label: 'Evita contato visual' },
              { k: 'sin_evita_contato_fisico',    label: 'Evita contato físico' },
              { k: 'sin_movimentos_repetitivos',  label: 'Movimentos repetitivos' },
              { k: 'sin_frouxidao',               label: 'Frouxidão muscular / hipotonia' },
              { k: 'sin_macroquidia',             label: 'Macroorquidia (testículos grandes)' },
              { k: 'sin_face_alongada',           label: 'Face alongada / orelhas proeminentes' },
            ].map(({ k, label }) => (
              <label key={k}>
                <input type="checkbox" checked={form[k]} onChange={() => toggle(k)} style={{ width: 'auto', marginTop: 2 }} />
                {label}
              </label>
            ))}
          </div>

          {/* TERMOS */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={form.termos} onChange={() => toggle('termos')} style={{ width: 'auto', marginTop: 3 }} />
              <span>Ao enviar este formulário, você concorda com o uso dos dados fornecidos para fins de triagem médica relacionados à Síndrome do X Frágil, em conformidade com a LGPD (Lei 13.709/2018). Os dados serão tratados com sigilo e utilizados exclusivamente para contato e acompanhamento clínico.</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
