const express = require("express"); // importa o framework express pra criar o servidor e a API
//CORS é uma politica de segurança dos navegadores que bloqueia requisições de origens diferentes, como o frontend rodando na porta 3000 e o backend na 3001, com o cors a gente vai conseguir liberar isso e permitir que o frontend consiga se comunicar com o backend sem problemas
const cors = require("cors"); // libera a porta 3000 ad o react para fazer requisicoes pro backend que é a porta 3001, sem isso ia ser bloqueado por causa do cors
const app = express();
const path = require("path");
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3002"] })); // aqui a gente ta dizendo pro cors liberar o acesso pro frontend que ta rodando na porta 3000, e pro admin que ta rodando na porta 3002, assim os dois conseguem se comunicar com o backend sem problemas, se a gente quiser liberar pra qualquer origem é só usar app.use(cors()) sem passar nenhum parametro, mas é mais seguro especificar as origens que a gente quer liberar, assim a gente evita que outros sites maliciosos consigam acessar nossa API
app.use(express.json()); // pro servidor conseguir ler em json, sem isdso quando o react mandasee os dados o back nao ia conseguir ler
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // aqui a gente ta dizendo pro express servir os arquivos estaticos da pasta uploads quando a url começar com /uploads, assim quando o frontend pedir uma imagem do paciente, por exemplo, ele vai conseguir acessar a imagem que ta salva na pasta uploads, sem isso o backend nao ia conseguir servir as imagens pro frontend, e ia dar erro de 404 quando o frontend tentasse acessar a imagem
app.use("/api/auth", require("./routes/auth")); //todas as rotas de autenticacao vao começar com /api/auth, e a gente importa as rotas do arquivo auth.js
app.use("/api/usuarios", require("./routes/usuarios")); //todas as rotas de usuarios vao começar com /api/usuarios, e a gente importa as rotas do arquivo usuarios.js
app.use("/api/pacientes", require("./routes/pacientes")); //todas as rotas de pacientes vao começar com /api/pacientes, e a gente importa as rotas do arquivo pacientes.js
app.use("/api/consultas", require("./routes/consultas")); //todas as rotas de consultas vao começar com /api/consultas, e a gente importa as rotas do arquivo consultas.js
app.use("/api/checklist", require("./routes/checklist")); //todas as rotas de checklist vao começar com /api/checklist, e a gente importa as rotas do arquivo checklist.js
app.use("/api/laudos", require("./routes/laudos")); //todas as rotas de laudos  vao começar com /api/laudos, e a gente importa as rotas do arquivo laudos.js

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
