// o outlet é onde o o reactrouter vai renderizar a pagina atual, o layout (topbar + sidebar)é fixa e o outlet vai ser o espaço variavel onde cada pagina aparece
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Borboleta } from "./simbuloBorboleta";
import { getUser } from "../services/api";

const s = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#fff",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 28px",
    background: "#0a0a0a",
    borderBottom: "2px solid #1a6fff",
    flexShrink: 0,
  },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoTxt: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    letterSpacing: 5,
    color: "#fff",
    lineHeight: 1,
  },
  logoSub: {
    fontSize: 8,
    letterSpacing: 4,
    color: "#446",
    textTransform: "uppercase",
    marginTop: -2,
  },
  utag: {
    fontSize: 10,
    letterSpacing: 1,
    color: "#446",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  udot: { width: 6, height: 6, borderRadius: "50%", background: "#1a6fff" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  sidebar: {
    width: 210,
    flexShrink: 0,
    background: "#0a0a0a",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #1a1a1a",
  },
  sbl: {
    padding: "16px 0 4px 18px",
    fontSize: 8,
    letterSpacing: 3,
    color: "#2a2a2a",
    textTransform: "uppercase",
  },
  si: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    fontSize: 11,
    color: "#446",
    letterSpacing: 1,
    cursor: "pointer",
    borderLeft: "2px solid transparent",
    background: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  siActive: {
    color: "#fff",
    borderLeft: "2px solid #1a6fff",
    background: "rgba(26,111,255,0.07)",
  },
  dash: { width: 10, height: 1, background: "currentColor", flexShrink: 0 },
  sbot: {
    marginTop: "auto",
    padding: "14px 18px",
    borderTop: "1px solid #1a1a1a",
  },
  av: { display: "flex", alignItems: "center", gap: 8 },
  avc: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#0d1a33",
    border: "1px solid #1a6fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#1a6fff",
    flexShrink: 0,
  },
  avn: { fontSize: 11, color: "#ccc", fontWeight: 600 },
  avr: { fontSize: 9, color: "#446" },
  content: { flex: 1, overflow: "auto" },
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  const menuItems = [
    // aqui vao ficar alguns perfis, cada item da side bar tem uma lista de perfis que podem velo, o visiblemenu filtra automaticamente com base no perfil do usuario logado, o admin vai consegir ver tudo, e o responsavel menos
    {
      label: "Início",
      path: "/home",
      perfis: ["admin", "medico", "secretaria", "responsavel"],
    },
    {
      label: "Novo Paciente",
      path: "/cadastro",
      perfis: ["admin", "medico", "responsavel"],
    },
    {
      label: "Checklist",
      path: "/checklist",
      perfis: ["admin", "medico", "responsavel"],
    },
  ];

  const adminItems = [
    { label: "Médicos", path: "/admin/medicos", perfis: ["admin"] },
    {
      label: "Secretaria",
      path: "/secretaria",
      perfis: ["admin", "secretaria"],
    },
  ];

  const visibleMenu = menuItems.filter((i) => i.perfis.includes(user?.perfil));
  const visibleAdmin = adminItems.filter((i) =>
    i.perfis.includes(user?.perfil),
  );

  return (
    <div style={s.wrap}>
      <div style={s.topbar}>
        <div style={s.logo}>
          <Borboleta size={38} />
          <div>
            <div style={s.logoTxt}>EU DIGO X</div>
            <div style={s.logoSub}>Síndrome X Frágil</div>
          </div>
        </div>
        <div style={s.utag}>
          <div style={s.udot}></div>
          {user?.nome} — {user?.perfil}
        </div>
      </div>

      <div style={s.body}>
        <div style={s.sidebar}>
          <div style={s.sbl}>menu</div>
          {visibleMenu.map((item) => (
            <button
              key={item.label}
              // o location.pathname, compara o caminho atual da URL com o path de cada item para saber qual esta ativo e aplicar o estilo siActive com a borda azul a esquerda
              style={{
                ...s.si,
                ...(location.pathname === item.path ? s.siActive : {}),
              }}
              onClick={() => navigate(item.path)}
            >
              <div style={s.dash}></div>
              {item.label}
            </button>
          ))}

          {visibleAdmin.length > 0 && (
            <>
              <div style={{ ...s.sbl, marginTop: 8 }}>admin</div>
              {visibleAdmin.map((item) => (
                <button
                  key={item.label}
                  style={{
                    ...s.si,
                    ...(location.pathname === item.path ? s.siActive : {}),
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <div style={s.dash}></div>
                  {item.label}
                </button>
              ))}
            </>
          )}

          <div style={s.sbot}>
            <div style={s.av}>
              <div style={s.avc}>{user?.nome?.[0]?.toUpperCase()}</div>
              <div>
                <div style={s.avn}>{user?.nome}</div>
                <div style={s.avr}>{user?.perfil}</div>
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                marginTop: 10,
                fontSize: 9,
                letterSpacing: 2,
                color: "#446",
                background: "none",
                border: "none",
                cursor: "pointer",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              → Sair
            </button>
          </div>
        </div>

        <div style={s.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
