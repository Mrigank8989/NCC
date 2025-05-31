quizzes.js
const express = require('express');
const pool = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [quizzes] = await pool.query('SELECT quiz_id, difficulty, set_number, title, total_questions FROM quizzes');
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:quiz_id/questions', authenticateToken, async (req, res) => {
  const { quiz_id } = req.params;
  try {
    const [questions] = await pool.query(
      'SELECT question_id, question_text, option_1, option_2, option_3, option_4 FROM questions WHERE quiz_id = ?',
      [quiz_id]
    );
    // Shuffle questions and options
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    shuffledQuestions.forEach(q => {
      const options = [q.option_1, q.option_2, q.option_3, q.option_4];
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
      q.options = shuffledOptions;
    });
    res.json(shuffledQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { difficulty, set_number, title, total_questions } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO quizzes (difficulty, set_number, title, total_questions) VALUES (?, ?, ?, ?)',
      [difficulty, set_number, title, total_questions]
    );
    res.status(201).json({ quiz_id: result.insertId, message: 'Quiz created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:quiz_id/questions', authenticateToken, isAdmin, async (req, res) => {
  const { quiz_id } = req.params;
  const { question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO questions (quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option]
    );
    res.status(201).json({ question_id: result.insertId, message: 'Question added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;