// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importando nossos componentes e páginas
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Cadastro } from "./pages/Cadastro";
import { Checklist } from "./pages/Checklist";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública (Fora do Layout, sem barra lateral) */}
        <Route path="/" element={<Login />} />

        {/* Rotas privadas (Dentro do Layout, com barra lateral) */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/checklist" element={<Checklist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
