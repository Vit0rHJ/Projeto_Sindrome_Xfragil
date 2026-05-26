const mysql = require("mysql2/promise"); //importa o mysql2 na versao com suporte para async/await, para as queries
const path = require("path"); //importa o path, que é um modulo nativo do node, para lidar com caminhos de arquivos
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") }); // ele vai ler o .env e colocar toda as variaveis de ambiente dentro de process.env

const pool = mysql.createPool({ // cria uma pool de conexões com o banco de dados, isso é mais eficiente do que criar uma nova conexão a cada query ja que no sisitema vamos ter varios medicos logados ao mesmo tempo, entao a pool vai gerenciar as conexões pra gente
  //pega os dados do banvo do .env, assim a gente não precisa colocar os dados sensiveis do banco de dados no código, e se precisar mudar alguma coisa é só mudar no .env sem precisar mexer no código
  host: process.env.DB_HOST, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, //maximo de 10 conexoes simultaneas, pra nao sobrecarregar o banco
});

module.exports = pool; //  exporta a pool para que a gente possa usar ela em outros arquivos e fazer as queries no banco de dados
