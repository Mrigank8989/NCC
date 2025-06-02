scores.js
const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/:quiz_id/submit', authenticateToken, async (req, res) => {
  const { quiz_id } = req.params;
  const { answers, time_taken } = req.body; // answers: [{ question_id, selected_option }]
  const user_id = req.user.user_id;
  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // Get correct answers
    const [questions] = await pool.query('SELECT question_id, correct_option FROM questions WHERE quiz_id = ?', [quiz_id]);
    let score = 0;
    const total_questions = questions.length;

    // Calculate score and prepare user answers
    const userAnswers = answers.map(answer => {
      const question = questions.find(q => q.question_id === answer.question_id);
      const is_correct = question && answer.selected_option === question.correct_option;
      if (is_correct) score++;
      return [answer.question_id, answer.selected_option, is_correct ? 1 : 0];
    });

    // Insert quiz attempt
    const percentage = Math.round((score / total_questions) * 100);
    const [attemptResult] = await pool.query(
      'INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, percentage, time_taken) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, quiz_id, score, total_questions, percentage, time_taken]
    );
    const attempt_id = attemptResult.insertId;

    // Insert user answers
    if (userAnswers.length > 0) {
      const answerQuery = 'INSERT INTO user_answers (attempt_id, question_id, selected_option, is_correct) VALUES ?';
      await pool.query(answerQuery, [userAnswers.map(ua => [attempt_id, ...ua])]);
    }

    await pool.query('COMMIT');
    res.json({ score, total_questions, percentage, attempt_id, message: 'Quiz submitted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/:user_id/scores', authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  if (req.user.user_id !== parseInt(user_id) && !req.user.is_admin) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try {
    const [scores] = await pool.query(
      `SELECT qa.attempt_id, qa.quiz_id, q.difficulty, q.set_number, qa.score, qa.total_questions, qa.percentage, qa.time_taken, qa.attempt_date
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.quiz_id
       WHERE qa.user_id = ?
       ORDER BY qa.attempt_date DESC`,
      [user_id]
    );
    res.json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;