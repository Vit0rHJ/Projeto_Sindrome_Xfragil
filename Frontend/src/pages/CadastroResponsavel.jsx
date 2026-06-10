import { useState } from "react";
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
  error: {
    background: "#fff0f0",
    border: "1px solid #ffcccc",
    color: "#cc0000",
    fontSize: 11,
    padding: "8px 12px",
    marginBottom: 12,
  },
  success: {
    background: "#f0fff4",
    border: "1px solid #ccffcc",
    color: "#006600",
    fontSize: 11,
    padding: "8px 12px",
    marginBottom: 12,
  },
  linkWrap: { textAlign: "center", fontSize: 12, color: "#888", marginTop: 20 },
  link: { color: "#1a6fff", fontWeight: 500, textDecoration: "none" },
};

export default function CadastroResponsavel() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    //atualiza o estado form de forma generica usando o home do input  como chave , assim um unico handler serve para todos os campos
    setForm({ ...form, [e.target.name]: e.target.value }); //copia todos os campos existentes e atualiza apenas oq mudou
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await api.post("/auth/cadastro-responsavel", form);
      setSucesso("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => navigate("/"), 2000); // apos o cadastro bem sucedido, espera 2 segundos para o usuario ler a mensagem de sucesso antes de redirecionar para o login
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <Borboleta size={100} />
        <div style={s.brand}>
          <div style={s.brandTitle}>EU DIGO X</div>
          <div style={s.brandSub}>Síndrome X Frágil</div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.corner}></div>
        <div style={s.eye}>cadastro de responsável</div>
        <div style={s.title}>
          Criar
          <br />
          conta
        </div>
        <div style={s.sub}>Cadastre-se para acessar o sistema</div>

        <form onSubmit={handleSubmit}>
          {erro && <div style={s.error}>{erro}</div>}
          {sucesso && <div style={s.success}>{sucesso}</div>}
          <label style={s.label}>Nome completo</label>
          <input
            style={s.input}
            name="nome"
            placeholder="Seu nome completo"
            value={form.nome}
            onChange={handleChange}
            required
          />
          <label style={s.label}>E-mail</label>
          <input
            style={s.input}
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label style={s.label}>Senha</label>
          <input
            style={s.input}
            name="senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={form.senha}
            onChange={handleChange}
            required
          />
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
            <div style={s.btnBar}></div>
          </button>
        </form>

        <div style={s.linkWrap}>
          Já tem conta?{" "}
          <Link to="/" style={s.link}>
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
