const pool = require('../config/db');

exports.addComment = async (req, res) => {
  const { id: cat_id } = req.params;
  const { content } = req.body;
  const user_id = req.user.userId;

  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, cat_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, cat_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l’inserimento del commento' });
  }
};

exports.getComments = async (req, res) => {
  const { id: cat_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE cat_id = $1
       ORDER BY created_at ASC`,
      [cat_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero dei commenti' });
  }
};
