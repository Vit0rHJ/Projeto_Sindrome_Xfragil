const bcscrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function login(req, res) {
  const { email, senha } = req.body
const [rows] = await db.query
('SELECT * FROM usuarios WHERE email = ?', [email])
if (!rows.length) {
  return res.status(401).json({ error: 'Usuario não encontrado' })
  const ok = await bcscrypt.compare(senha, rows[0].senha)
  if (!ok) {
    return res.status(401).json({ error: 'Senha incorreta' })

    const token = jwt.sign(
        { id: rows[0].id, perfil: rows[0].perfil },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    )
    res.json({toke, nome: row[0].nome, perfil: rows[0].perfil }) 
 }
module.exports = {login}  
}
}

