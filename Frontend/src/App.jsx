import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Cadastro } from "./pages/Cadastro";
import { Home } from "./pages/Home";
import { Checklist } from "./pages/Checklist";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro-profissional" element={<Cadastro />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/checklist" element={<Checklist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;