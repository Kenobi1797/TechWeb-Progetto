const pool = require('../config/db');
const path = require('path');

exports.createCat = async (req, res) => {
  const { title, description, latitude, longitude } = req.body;
  if (!title || !latitude || !longitude) {
    return res.status(400).json({ error: 'Titolo, latitudine e longitudine sono obbligatori' });
  }
  const image_url = req.file ? req.file.filename : null;

  try {
    const result = await pool.query(
      `INSERT INTO cats (user_id, title, description, image_url, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.userId, title, description, image_url, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l’inserimento del gatto', details: err.message });
  }
};

exports.getAllCats = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, latitude, longitude, image_url, created_at FROM cats ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero dei gatti' });
  }
};

exports.getCatById = async (req, res) => {
  const { id } = req.params;
  try {
    const catResult = await pool.query('SELECT * FROM cats WHERE id = $1', [id]);
    if (catResult.rows.length === 0) return res.status(404).json({ error: 'Gatto non trovato' });

    const comments = await pool.query(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE cat_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      ...catResult.rows[0],
      comments: comments.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero del dettaglio', details: err.message });
  }
};
