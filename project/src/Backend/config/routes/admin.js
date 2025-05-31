const express = require('express');
const pool = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/scores', authenticateToken, isAdmin, async (req, res) => {
  const { user_id, difficulty } = req.query;
  try {
    let query = `
      SELECT qa.attempt_id, u.username, u.full_name, q.difficulty, q.set_number, qa.score, qa.total_questions, qa.percentage, qa.attempt_date
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.user_id
      JOIN quizzes q ON qa.quiz_id = q.quiz_id
      WHERE u.username != 'admin'`;
    const params = [];
    if (user_id) {
      query += ' AND qa.user_id = ?';
      params.push(user_id);
    }
    if (difficulty) {
      query += ' AND q.difficulty = ?';
      params.push(difficulty);
    }
    query += ' ORDER BY qa.attempt_date DESC';

    const [scores] = await pool.query(query, params);
    res.json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/scores/:attempt_id', authenticateToken, isAdmin, async (req, res) => {
  const { attempt_id } = req.params;
  try {
    await pool.query('DELETE FROM quiz_attempts WHERE attempt_id = ?', [attempt_id]);
    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.user_id, u.username, u.full_name, COUNT(qa.attempt_id) as quizzes_taken,
       COALESCE(ROUND(AVG(qa.percentage), 0), 0) as average_score
       FROM users u
       LEFT JOIN quiz_attempts qa ON u.user_id = qa.user_id
       WHERE u.username != 'admin'
       GROUP BY u.user_id, u.username, u.full_name`
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:user_id', authenticateToken, isAdmin, async (req, res) => {
  const { user_id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE user_id = ? AND username != "admin"', [user_id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/statistics', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(attempt_id) as total_attempts,
        COALESCE(ROUND(AVG(percentage), 0), 0) as average_score,
        COALESCE(MAX(percentage), 0) as highest_score,
        (SELECT COUNT(*) FROM users WHERE username != 'admin') as registered_users,
        COALESCE(ROUND(AVG(CASE WHEN q.difficulty = 'easy' THEN qa.percentage END), 0), 0) as easy_avg,
        COALESCE(ROUND(AVG(CASE WHEN q.difficulty = 'intermediate' THEN qa.percentage END), 0), 0) as intermediate_avg,
        COALESCE(ROUND(AVG(CASE WHEN q.difficulty = 'hard' THEN qa.percentage END), 0), 0) as hard_avg
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.quiz_id
    `);
    res.json(stats[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;