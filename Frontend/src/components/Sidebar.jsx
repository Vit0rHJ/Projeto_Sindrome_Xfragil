import { Link, useLocation, useNavigate } from "react-router-dom";

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Decode user info from JWT
  let user = { nome: "Médico", perfil: "medico" };
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      user = payload;
    }
  } catch (_) {}

  const navItems = [
    {
      to: "/home",
      label: "Início",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      to: "/cadastro-profissional",
      label: "Novo Cadastro",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/>
          <line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      ),
    },
    {
      to: "/checklist",
      label: "Nova Consulta",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
  ];

  if (user.perfil === "admin") {
    navItems.push({
      to: "/admin/medicos",
      label: "Médicos",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    });
  }

  function handleSair() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <aside style={styles.aside}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
            <path d="M20 14 Q32 24 44 14" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M20 30 Q32 40 44 30" stroke="rgba(255,255,255,0.75)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M20 46 Q32 56 44 46" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <line x1="20" y1="14" x2="20" y2="46" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
            <line x1="44" y1="14" x2="44" y2="46" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
          </svg>
        </div>
        <div>
          <div style={styles.logoTitle}>X Frágil</div>
          <div style={styles.logoSub}>Gestão Clínica</div>
        </div>
      </div>

      {/* User badge */}
      <div style={styles.userBadge}>
        <div style={styles.userAvatar}>
          {user.nome ? user.nome.charAt(0).toUpperCase() : "U"}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user.nome || "Usuário"}</span>
          <span style={styles.userRole}>{user.perfil === "admin" ? "Administrador" : "Médico"}</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <p style={styles.navLabel}>MENU</p>
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                ...styles.navItem,
                background: active ? "rgba(255,255,255,0.13)" : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.65)",
                borderLeft: active ? "3px solid white" : "3px solid transparent",
              }}
            >
              <span style={{ color: active ? "white" : "rgba(255,255,255,0.55)" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerDivider} />
        <button onClick={handleSair} style={styles.sairBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}

const styles = {
  aside: {
    width: "240px",
    flexShrink: 0,
    background: "linear-gradient(180deg, #0a2560 0%, #1448a8 100%)",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "16px",
    fontWeight: 700,
    color: "white",
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(0,0,0,0.1)",
  },
  userAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
    color: "white",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    overflow: "hidden",
  },
  userName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "white",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  nav: {
    flex: 1,
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  navLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.12em",
    padding: "0 8px",
    marginBottom: "8px",
    marginTop: 0,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  },
  footer: {
    padding: "0 12px 20px",
  },
  footerDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    marginBottom: "12px",
  },
  sairBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
  },
};
