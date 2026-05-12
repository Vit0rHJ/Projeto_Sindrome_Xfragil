// src/components/Layout.jsx
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px', backgroundColor: '#ffffff' }}>
        {/* O Outlet é onde as páginas vão ser renderizadas */}
        <Outlet />
      </main>
    </div>
  );
}