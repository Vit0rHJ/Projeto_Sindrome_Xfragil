const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host :     process.env.DB_HOST,
    usuario:     process.env.DB_USER,
    senha: process.env.DB_PASSWORD,
    banco: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = pool;