// Fluxo de cadastro — ao submeter, primeiro cria o paciente e pega o id retornado. Depois usa esse id para criar a consulta e pega o consulta_id. Por fim redireciona direto para o checklist com o consulta_id na URL.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const s = {
  wrap: { padding: '28px 32px', overflow: 'auto', height: 'calc(100vh - 62px)', background: '#fff' },
  eye: { fontSize: 8, letterSpacing: 4, textTransform: 'uppercase', color: '#1a6fff', marginBottom: 5 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 2, color: '#0a0a0a', lineHeight: 1, marginBottom: 4 },
  sub: { fontSize: 10, color: '#999', letterSpacing: 1, marginBottom: 28 },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', maxWidth: 820 },
  sectionTitle: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#0a0a0a', marginBottom: 16, marginTop: 24, paddingBottom: 8, borderBottom: '1px solid #e8e8e8', gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8 },
  sectionDot: { width: 6, height: 6, borderRadius: '50%', background: '#1a6fff' },
  footer: { gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e8e8e8' },
  btnCancel: { fontSize: 9, letterSpacing: 2, padding: '8px 16px', border: '1px solid #e0e0e0', color: '#888', background: '#fff', cursor: 'pointer', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" },
  btnSave: { fontSize: 9, letterSpacing: 2, padding: '8px 20px', border: 'none', color: '#fff', background: '#0a0a0a', cursor: 'pointer', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", position: 'relative' },
  btnBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#1a6fff' },
  error: { gridColumn: '1 / -1', background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', fontSize: 11, padding: '8px 12px', marginBottom: 8 },
}

const fieldStyle = { marginBottom: 16 }
const labelStyle = { display: 'block', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 6 }
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 12, color: '#0a0a0a', background: '#fafafa', outline: 'none' }

//Field e Select — componentes internos criados dentro da página para evitar repetição. Em vez de escrever o mesmo bloco de label + input 15 vezes, chamamos <Field name="cpf" label="CPF" />.
function Field({ name, label, type = 'text', required = false, form, onChange }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}{required && ' *'}</label>
      <input style={inputStyle} name={name} type={type} value={form[name]} onChange={onChange} required={required} />
    </div>
  )
}

function Select({ name, label, options, required = false, form, onChange }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}{required && ' *'}</label>
      <select style={inputStyle} name={name} value={form[name]} onChange={onChange} required={required}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export default function Cadastro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', cpf: '', data_nascimento: '', sexo: '', email: '', telefone: '',
    nome_mae: '', nome_pai: '', cidade: '', estado: '', pais: 'Brasil',
    nome_responsavel: '', cpf_responsavel: '', telefone_responsavel: '', grau_parentesco: '',
    ja_fez_exame_dna: 0, interesse_exame_pcr: 0,
    diagnostico_autismo: 0, tem_irmaos: 0,
    historico_familiar_di: 'nao', historico_menopausa: 'nao', historico_ataxia: 'nao',
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data: pacData } = await api.post('/pacientes', form)
      const dataConsulta = new Date().toISOString().split('T')[0]
      const { data: consData } = await api.post('/consultas', {
        paciente_id: pacData.id,
        data_consulta: dataConsulta,
        observacoes: '',
      })
      navigate(`/checklist?consulta_id=${consData.consulta_id}`)
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao cadastrar paciente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.eye}>novo cadastro de paciente</div>
      <div style={s.title}>Cadastro de Paciente</div>
      <div style={s.sub}>Preencha os dados para registrar um novo paciente e iniciar o checklist</div>

      <form onSubmit={handleSubmit} style={s.form}>
        {erro && <div style={s.error}>{erro}</div>}

        <div style={s.sectionTitle}><div style={s.sectionDot}></div>Dados do Paciente</div>
        <Field name="nome"            label="Nome completo"      required form={form} onChange={handleChange} />
        <Field name="cpf"             label="CPF"                required form={form} onChange={handleChange} />
        <Field name="data_nascimento" label="Data de nascimento" type="date" form={form} onChange={handleChange} />
        <Select name="sexo" label="Sexo" form={form} onChange={handleChange} options={[
          { value: '', label: 'Selecione' },
          { value: 'M', label: 'Masculino' },
          { value: 'F', label: 'Feminino' },
        ]} />
        <Field name="email"    label="E-mail"   type="email" form={form} onChange={handleChange} />
        <Field name="telefone" label="Telefone" form={form} onChange={handleChange} />
        <Field name="nome_mae" label="Nome da mãe" form={form} onChange={handleChange} />
        <Field name="nome_pai" label="Nome do pai" form={form} onChange={handleChange} />
        <Field name="cidade"   label="Cidade" form={form} onChange={handleChange} />
        <Field name="estado"   label="Estado" form={form} onChange={handleChange} />

        <div style={s.sectionTitle}><div style={s.sectionDot}></div>Dados do Responsável</div>
        <Field name="nome_responsavel"     label="Nome do responsável"     required form={form} onChange={handleChange} />
        <Field name="cpf_responsavel"      label="CPF do responsável"      required form={form} onChange={handleChange} />
        <Field name="telefone_responsavel" label="Telefone do responsável" required form={form} onChange={handleChange} />
        <Select name="grau_parentesco" label="Grau de parentesco" form={form} onChange={handleChange} options={[
          { value: '', label: 'Selecione' },
          { value: 'mae', label: 'Mãe' },
          { value: 'pai', label: 'Pai' },
          { value: 'avo', label: 'Avó / Avô' },
          { value: 'outro', label: 'Outro' },
        ]} />

        <div style={s.sectionTitle}><div style={s.sectionDot}></div>Histórico Clínico</div>
        <Select name="ja_fez_exame_dna" label="Já fez exame de DNA?" form={form} onChange={handleChange} options={[
          { value: 0, label: 'Não' }, { value: 1, label: 'Sim' },
        ]} />
        <Select name="interesse_exame_pcr" label="Interesse em exame PCR?" form={form} onChange={handleChange} options={[
          { value: 0, label: 'Não' }, { value: 1, label: 'Sim' },
        ]} />
        <Select name="diagnostico_autismo" label="Diagnóstico de autismo?" form={form} onChange={handleChange} options={[
          { value: 0, label: 'Não' }, { value: 1, label: 'Sim' },
        ]} />
        <Select name="tem_irmaos" label="Tem irmãos?" form={form} onChange={handleChange} options={[
          { value: 0, label: 'Não' }, { value: 1, label: 'Sim' },
        ]} />
        <Select name="historico_familiar_di" label="Histórico familiar de DI?" form={form} onChange={handleChange} options={[
          { value: 'nao', label: 'Não' }, { value: 'sim', label: 'Sim' },
        ]} />
        <Select name="historico_menopausa" label="Histórico de menopausa precoce?" form={form} onChange={handleChange} options={[
          { value: 'nao', label: 'Não' }, { value: 'sim', label: 'Sim' },
        ]} />

        <div style={s.footer}>
          <button type="button" style={s.btnCancel} onClick={() => navigate('/home')}>Cancelar</button>
          <button type="submit" style={s.btnSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar e ir para checklist'}
            <div style={s.btnBar}></div>
          </button>
        </div>
      </form>
    </div>
  )
}