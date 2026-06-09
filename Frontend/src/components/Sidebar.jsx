import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const IconGrid     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IconUsers    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCalendar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconSteth    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>;
const IconLogout   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconShield   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const PERFIL_LABEL = { admin: 'Administrador', secretaria: 'Secretaria', medico: 'Médico(a)' };

export default function Sidebar() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const isActive  = (path) => pathname.startsWith(path);
  const handleLogout = () => { signOut(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>X Frágil</span>
        <small>Sistema de Triagem</small>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <IconGrid /> Dashboard
        </button>

        <button
          className={`nav-link ${isActive('/pacientes') ? 'active' : ''}`}
          onClick={() => navigate('/pacientes')}
        >
          <IconUsers /> Pacientes
        </button>

        <button
          className={`nav-link ${isActive('/consultas') ? 'active' : ''}`}
          onClick={() => navigate('/consultas/nova')}
        >
          <IconCalendar /> Nova Consulta
        </button>

        {isAdmin && (
          <>
            <button
              className={`nav-link ${isActive('/medicos') ? 'active' : ''}`}
              onClick={() => navigate('/medicos')}
            >
              <IconSteth /> Médicos
            </button>
            <button
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              <IconShield /> Painel Admin
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">{user?.nome}</div>
        <div className="sidebar-role">{PERFIL_LABEL[user?.perfil] || user?.perfil}</div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
        >
          <IconLogout /> Sair
        </button>
      </div>
    </aside>
  );
}
