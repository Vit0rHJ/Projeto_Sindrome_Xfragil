import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PublicInfo() {
  const navigate = useNavigate();

  return (
    <div className="public-page">
      <div className="public-hero">
        <h1>Síndrome do X Frágil</h1>
        <p>Informação, acolhimento e triagem precoce para famílias e pacientes</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/cadastro-paciente-publico')}
            style={{ background: '#fff', color: 'var(--blue)', fontWeight: 600, padding: '12px 28px', borderRadius: 8 }}>
            Preencher Formulário do Paciente
          </button>
          <button className="btn-secondary" onClick={() => navigate('/login')}
            style={{ border: '1.5px solid rgba(255,255,255,0.6)', color: '#fff', padding: '12px 28px', borderRadius: 8 }}>
            Acesso Profissional
          </button>
        </div>
      </div>

      <div className="public-body">
        <div className="contact-bar">
          Dúvidas? Entre em contato: <strong>contato@institutoxfragil.org.br</strong> ou ligue <strong>41 3156-0509</strong>
        </div>

        <div className="info-card">
          <h3>O que é a Síndrome do X Frágil?</h3>
          <p>
            A Síndrome do X Frágil é a causa hereditária mais comum de deficiência intelectual e a causa genética mais frequente de autismo. É causada por uma mutação no gene FMR1, localizado no cromossomo X, que leva à ausência ou redução da proteína FMRP — essencial para o desenvolvimento cerebral.
          </p>
        </div>

        <div className="info-card">
          <h3>Sinais e sintomas mais comuns</h3>
          <p>
            Os sinais incluem atraso na fala e na linguagem, dificuldades de aprendizado, déficit de atenção, hiperatividade, comportamentos repetitivos, evitação de contato visual e físico, face alongada, orelhas proeminentes e, em meninos após a puberdade, macroorquidia. A intensidade varia bastante entre os indivíduos.
          </p>
        </div>

        <div className="info-card">
          <h3>Diagnóstico e tratamento</h3>
          <p>
            O diagnóstico é confirmado por exame de DNA (teste molecular) que identifica a mutação no gene FMR1. Quanto mais cedo o diagnóstico, melhor a resposta às intervenções terapêuticas como fonoaudiologia, terapia ocupacional, psicologia e apoio educacional especializado.
          </p>
        </div>

        <div className="info-card">
          <h3>Hereditariedade</h3>
          <p>
            A síndrome segue um padrão de herança ligado ao X. Mães portadoras da pré-mutação podem transmitir a mutação completa aos filhos. Irmãos de pessoas afetadas têm maior risco, assim como outros membros da família materna. O aconselhamento genético é fundamental para as famílias.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Seu filho ou familiar apresenta alguns desses sinais? Preencha o formulário de triagem abaixo — um profissional de saúde entrará em contato.
          </p>
          <button className="btn-primary" onClick={() => navigate('/cadastro-paciente-publico')}
            style={{ padding: '12px 32px', fontSize: 15 }}>
            Preencher Formulário de Triagem
          </button>
        </div>
      </div>
    </div>
  );
}
