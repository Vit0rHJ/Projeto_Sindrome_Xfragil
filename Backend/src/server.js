const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// -----------------------------------------------------------------
// Middlewares globais
// -----------------------------------------------------------------
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// -----------------------------------------------------------------
// Teste de conexão com o banco ao iniciar o servidor
// -----------------------------------------------------------------
const pool = require('./config/db');

pool.getConnection()
    .then(conn => {
        console.log('✅ Banco de dados conectado!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar no banco:', err.message);
    });

// -----------------------------------------------------------------
// Rotas (vamos importar aqui conforme formos criando)
// -----------------------------------------------------------------
// app.use('/api/auth',      require('./routes/auth'));
// app.use('/api/pacientes', require('./routes/pacientes'));
// app.use('/api/consultas', require('./routes/consultas'));
// app.use('/api/checklist', require('./routes/checklist'));
// app.use('/api/laudos',    require('./routes/laudos'));

// -----------------------------------------------------------------
// Iniciar servidor
// -----------------------------------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});