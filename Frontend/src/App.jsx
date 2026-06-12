
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getUser } from './services/api'
import Layout from './components/Layout'
import Login from './pages/Login'
import CadastroResponsavel from './pages/CadastroResponsavel'
import Home from './pages/Home'
import Cadastro from './pages/Cadastro'
import Checklist from './pages/Checklist'
import Pacientes from './pages/Pacientes'
import Laudo from './pages/Laudo'
import Laudos from './pages/Laudos'
import Secretaria from './pages/Secretaria'
import AdminMedicos from './pages/AdminMedicos'
import AdminSecretarias from './pages/AdminSecretarias'
import Relatorios from './pages/Relatorios'
// o Privateroute, serve como componente de protecao , antes de renderizar qualquer pagina protegida, ele vai verificar se existe um token valido no localstorage, se nao tiver manda devolta para o login, se apenasAdmin for true, verifica tambem  se o perfil é admin
function PrivateRoute({ children, apenasAdmin = false }) {
  const user = getUser()
  if (!user) return <Navigate to="/" replace />
  if (apenasAdmin && user.perfil !== 'admin') return <Navigate to="/home" replace />
  return children
}
// as rotas dentro do <Route element={<PrivateRoute><Layout /></PrivateRoute>}>, herdam automaticamente a topbar e sidebar do layout
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro-responsavel" element={<CadastroResponsavel />} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/laudo/:consulta_id" element={<Laudo />} />  
          <Route path="/laudos" element={<Laudos />} />
          <Route path="/admin/medicos" element={<PrivateRoute apenasAdmin><AdminMedicos /></PrivateRoute>} />
          <Route path="/admin/secretarias" element={<PrivateRoute apenasAdmin><AdminSecretarias /></PrivateRoute>} />
          <Route path="/secretaria" element={<Secretaria />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Route>
        // o path="*"  captura qualquer rota  desconhecida e redireciona para o login
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}