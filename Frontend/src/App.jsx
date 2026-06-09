import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Home             from './pages/Home';
import FormularioPacientePublico from './pages/FormularioPacientePublico';
import Login           from './pages/Login';
import Layout          from './components/Layout';
import Dashboard       from './pages/Dashboard';
import Pacientes       from './pages/Pacientes';
import CadastroPaciente from './pages/CadastroPaciente';
import NovaConsulta    from './pages/NovaConsulta';
import Checklist       from './pages/Checklist';
import Laudo           from './pages/Laudo';
import Medicos         from './pages/Medicos';
import Admin           from './pages/Admin';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/"                    element={<Home />} />
          <Route path="/cadastro-paciente-publico" element={<FormularioPacientePublico />} />
          <Route path="/login"               element={<Login />} />

          {/* Área protegida */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="dashboard"          element={<Dashboard />} />
            <Route path="pacientes"          element={<Pacientes />} />
            <Route path="pacientes/novo"     element={<CadastroPaciente />} />
            <Route path="consultas/nova"     element={<NovaConsulta />} />
            <Route path="checklist/:consultaId" element={<Checklist />} />
            <Route path="laudo/:consultaId"  element={<Laudo />} />
            <Route path="medicos"            element={<AdminRoute><Medicos /></AdminRoute>} />
            <Route path="admin"              element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
