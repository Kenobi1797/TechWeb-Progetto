const pool = require('../config/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {};

authController.register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Registrazione avvenuta con successo', token, user });
  } catch (error) {
    if (error.code === '23505') {
      // email già registrata
      return res.status(400).json({ error: 'Email già registrata' });
    }
    res.status(500).json({ error: 'Errore durante la registrazione', details: error.message });
  }
};

authController.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatori' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login effettuato', token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il login', details: error.message });
  }
};

module.exports = authController;
