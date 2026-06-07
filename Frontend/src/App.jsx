import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Cadastro } from "./pages/Cadastro";
import { Home } from "./pages/Home";
import { Checklist } from "./pages/Checklist";
import { Laudo } from "./pages/Laudo";
import { AdminMedicos } from "./pages/AdminMedicos";

function getUser() {
  try { return JSON.parse(atob(localStorage.getItem("token").split(".")[1])); }
  catch { return null; }
}

function PrivateRoute({ children, adminOnly = false }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.perfil !== "admin") return <Navigate to="/home" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/laudo/:consulta_id" element={<Laudo />} />
          <Route path="/admin/medicos" element={<PrivateRoute adminOnly><AdminMedicos /></PrivateRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
