//o axios.create, cria um instancia do axios com a URL base do backend ja configurada, ent no front vamos poder chamar so /pacientes em vez de http://localhost:3001/api/pacientes 
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
})

// base das imagens servidas pelo backend (fotos de pacientes e medicos)
export const UPLOADS_URL = 'http://localhost:3001/uploads'

api.interceptors.request.use((config) => { //  toda requisicao que sair pelo axios vai passar aqui antes, ele vai pegar o token salvo no localstorage e  coloca altomaticamente mo cabecalho, ent nao vamos ter q fazer isso manualmente
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function getUser() { // essa funcao vai ler o token do localstorage e decodificar a parte do meio  o (playload), que contem nome, id, perfil do usuario logado o atob serve para converter base 64 para texto normal
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export default api