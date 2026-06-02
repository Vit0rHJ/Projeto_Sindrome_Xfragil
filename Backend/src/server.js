const express = require("express"); // importa o framework express pra criar o servidor e a API
//CORS é uma politica de segurança dos navegadores que bloqueia requisições de origens diferentes, como o frontend rodando na porta 3000 e o backend na 3001, com o cors a gente vai conseguir liberar isso e permitir que o frontend consiga se comunicar com o backend sem problemas
const cors = require("cors"); // libera a porta 3000 ad o react para fazer requisicoes pro backend que é a porta 3001, sem isso ia ser bloqueado por causa do cors

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json()); // pro servidor conseguir ler em json, sem isdso quando o react mandasee os dados o back nao ia conseguir ler
app.use("/api/auth", require("./routes/auth")); //todas as rotas de autenticacao vao começar com /api/auth, e a gente importa as rotas do arquivo auth.js
app.use("/api/usuarios", require("./routes/usuarios")); //todas as rotas de usuarios vao começar com /api/usuarios, e a gente importa as rotas do arquivo usuarios.js
app.use("/api/pacientes", require("./routes/pacientes")); //todas as rotas de pacientes vao começar com /api/pacientes, e a gente importa as rotas do arquivo pacientes.js
app.use("/api/consultas", require("./routes/consultas")); //todas as rotas de consultas vao começar com /api/consultas, e a gente importa as rotas do arquivo consultas.js
//a gente vai criar as rotas de pacientes e consultas depois, mas a ideia é a mesma, a gente cria um arquivo pra cada grupo de rotas, e importa elas aqui, e depois usa elas com o app.use, assim a gente organiza melhor o código, cada rota vai ficar em um arquivo diferente
const pool = require("./config/db");

pool
  .getConnection() //testa se a conexao com o banco esta funcionando
  .then((conn) => {
    console.log("Banco de dados conectado!");
    conn.release();
  })
  .catch((err) => {
    console.error("Erro ao conectar no banco:", err.message);
  });

// as rotas vamos iportar elas aqui, e depois usar elas com o app.use, assim a gente organiza melhor o código, cada rota vai ficar em um arquivo diferente
//const authRoutes = require('./routes/auth');
//const pacienteRoutes = require('./routes/pacientes');
//const consultaRoutes = require('./routes/consultas');
// A porta do servidor é definida no .env, se não tiver lá, vai usar a 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
//pra testar se ta funcionando é só rodar npm run dev, no backend/scrver.js, e acessar http://localhost:3001 no navegador, se aparecer "Servidor rodando em http://localhost:3001" é porque ta tudo certo, e depois é só testar as rotas com o postman ou com o front, quando ele tiver pronto
