// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside style={{ width: '250px', background: '#f4f4f4', height: '100vh', padding: '20px' }}>
      <h2>Admin Médico</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
        <Link to="/home">Início</Link>
        <Link to="/cadastro">Novo Paciente</Link>
        <Link to="/checklist">Nova Consulta (Checklist)</Link>
        <Link to="/" style={{ marginTop: 'auto', color: 'red' }}>Sair (Login)</Link>
      </nav>
    </aside>
  );
}