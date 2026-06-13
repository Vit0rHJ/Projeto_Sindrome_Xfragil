import { useState } from "react"; // controla os valores dos campos e estado de erro e login
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Borboleta } from "../components/simbuloBorboleta";

const s = {
  wrap: { display: "flex", height: "100vh" },
  left: {
    width: "44%",
    background: "#0a0a0a",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "40px 48px",
    position: "relative",
  },
  corner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderWidth: "0 28px 28px 0",
    borderColor: "transparent #1a6fff transparent transparent",
  },
  brand: { textAlign: "center", marginBottom: 12 },
  brandTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 36,
    letterSpacing: 6,
    color: "#fff",
    lineHeight: 1,
  },
  brandSub: {
    fontSize: 9,
    letterSpacing: 5,
    color: "#334",
    textTransform: "uppercase",
    marginTop: 4,
  },
  tags: { display: "flex", flexDirection: "column", gap: 10, marginTop: 24 },
  tag: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 11,
    color: "#446",
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "#1a6fff",
    flexShrink: 0,
  },
  eye: {
    fontSize: 8,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: "#1a6fff",
    marginBottom: 8,
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 40,
    letterSpacing: 2,
    color: "#0a0a0a",
    lineHeight: 1,
    marginBottom: 6,
  },
  sub: { fontSize: 12, color: "#aaa", marginBottom: 32 },
  label: {
    display: "block",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #e0e0e0",
    fontSize: 13,
    color: "#0a0a0a",
    background: "#fafafa",
    outline: "none",
    marginBottom: 16,
  },
  btn: {
    width: "100%",
    padding: 13,
    background: "#0a0a0a",
    color: "#fff",
    border: "none",
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Space Grotesk', sans-serif",
    position: "relative",
    marginTop: 8,
  },
  btnBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "#1a6fff",
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "20px 0" },
  divLine: { flex: 1, height: 1, background: "#e0e0e0" },
  divTxt: { fontSize: 10, color: "#ccc", letterSpacing: 1 },
  linkWrap: { textAlign: "center", fontSize: 12, color: "#888" },
  link: { color: "#1a6fff", fontWeight: 500, textDecoration: "none" },
  error: {
    background: "#fff0f0",
    border: "1px solid #ffcccc",
    color: "#cc0000",
    fontSize: 11,
    padding: "8px 12px",
    marginBottom: 12,
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  // o loading deabilita o botao enquanto aguarda a resposta do backend para evitar clipes duplos
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    // faz POST/auth/login com email e senha. se der certo salva o token no LocalStorage e redireciona para /home, se derv erro vai mostar a mensagem retornada pelo backend
    e.preventDefault(); // o comportamento padara0 da formulario é ficar recarregando a pagina, essa sessao impede que isso aconteça
    setErro("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, senha });
      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <Borboleta size={120} />
        <div style={s.brand}>
          <div style={s.brandTitle}>EU DIGO X</div>
          <div style={s.brandSub}>Síndrome X Frágil</div>
        </div>
        <div style={s.tags}>
          <div style={s.tag}>
            <div style={s.tagDot}></div>Checklist de triagem inteligente
          </div>
          <div style={s.tag}>
            <div style={s.tagDot}></div>Laudos clínicos automatizados
          </div>
          <div style={s.tag}>
            <div style={s.tagDot}></div>Gestão de pacientes centralizada
          </div>
        </div>

        {/* contato institucional do Instituto Buko Kaesemodel */}
        <div
          style={{
            marginTop: 36,
            paddingTop: 18,
            borderTop: "1px solid #1a1a2e",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#667", textTransform: "uppercase", marginBottom: 6 }}>
            Instituto Buko Kaesemodel
          </div>
          <div style={{ fontSize: 9, color: "#445" }}>
            Rua Fernando Simas, 172 – Bigorrilho, Curitiba-PR
          </div>
          <div style={{ fontSize: 9, color: "#445" }}>
            (41) 3156-0309 · WhatsApp (41) 99103-4847
          </div>
          <div style={{ fontSize: 9, color: "#445" }}>
            contato@eudigox.com.br
          </div>
          <div style={{ fontSize: 8, color: "#334", marginTop: 8 }}>
            Encarregada de Dados (LGPD): Luz Maria T. Romero Silva
            <br />
            luzmaria@institutobk.org.br
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.corner}></div>
        <div style={s.eye}>acesso ao sistema</div>
        <div style={s.title}>
          Bem-vindo
          <br />
          de volta
        </div>
        <div style={s.sub}>Acesse sua conta para continuar</div>

        <form onSubmit={handleSubmit}>
          {erro && <div style={s.error}>{erro}</div>}
          <label style={s.label}>E-mail</label>
          <input
            style={s.input}
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label style={s.label}>Senha</label>
          <input
            style={s.input}
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
            <div style={s.btnBar}></div>
          </button>
        </form>

        <div style={s.divider}>
          <div style={s.divLine}></div>
          <div style={s.divTxt}>ou</div>
          <div style={s.divLine}></div>
        </div>
        <div style={s.linkWrap}>
          Responsável?{" "}
          <Link to="/cadastro-responsavel" style={s.link}>
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
