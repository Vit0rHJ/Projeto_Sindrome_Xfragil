const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// ── Token helpers ────────────────────────────────────────────────────────────
export const getToken  = () => localStorage.getItem('xf_token');
export const getUser   = () => JSON.parse(localStorage.getItem('xf_user') || 'null');
export const saveAuth  = (token, usuario) => {
  localStorage.setItem('xf_token', token);
  localStorage.setItem('xf_user', JSON.stringify(usuario));
};
export const clearAuth = () => {
  localStorage.removeItem('xf_token');
  localStorage.removeItem('xf_user');
};

// ── Base fetch ───────────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.mensagem || `Erro ${res.status}`;
    if (res.status === 401) { clearAuth(); window.location.href = '/login'; }
    throw new Error(msg);
  }
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email, senha) =>
  api('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) });

// ── Pacientes ────────────────────────────────────────────────────────────────
export const listarPacientes   = () => api('/pacientes');
export const cadastrarPaciente = (dados) =>
  api('/pacientes', { method: 'POST', body: JSON.stringify(dados) });

// ── Consultas ────────────────────────────────────────────────────────────────
export const listarConsultas  = () => api('/consultas');
export const criarConsulta    = (dados) =>
  api('/consultas', { method: 'POST', body: JSON.stringify(dados) });
export const atualizarStatus  = (id, status) =>
  api(`/consultas/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// ── Checklist ────────────────────────────────────────────────────────────────
export const salvarChecklist  = (dados) =>
  api('/checklist', { method: 'POST', body: JSON.stringify(dados) });
export const buscarChecklist  = (consulta_id) =>
  api(`/checklist/${consulta_id}`);

// ── Usuários (admin) ──────────────────────────────────────────────────────────
export const listarMedicos    = () => api('/usuarios');
export const cadastrarMedico  = (dados) =>
  api('/usuarios', { method: 'POST', body: JSON.stringify(dados) });
