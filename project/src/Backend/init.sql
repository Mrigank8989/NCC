CREATE DATABASE IF NOT EXISTS ncc_quiz_portal;
USE ncc_quiz_portal;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
    quiz_id INT AUTO_INCREMENT PRIMARY KEY,
    difficulty ENUM('easy', 'intermediate', 'hard') NOT NULL,
    set_number INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    total_questions INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_1 TEXT NOT NULL,
    option_2 TEXT NOT NULL,
    option_3 TEXT NOT NULL,
    option_4 TEXT NOT NULL,
    correct_option INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
);

CREATE TABLE quiz_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    time_taken INT NOT NULL,
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
);

CREATE TABLE user_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option INT,
    is_correct BOOLEAN,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
);

-- Insert default admin user
INSERT INTO users (username, password_hash, full_name, is_admin)
VALUES ('admin', '$2b$10$YOUR_HASHED_PASSWORD', 'Admin User', TRUE);

-- Insert sample quiz data
INSERT INTO quizzes (difficulty, set_number, title, total_questions)
VALUES 
    ('easy', 1, 'Easy Set 1', 50),
    ('intermediate', 1, 'Intermediate Set 1', 50),
    ('hard', 1, 'Hard Set 1', 50);

-- Insert sample questions (example for Easy Set 1)
INSERT INTO questions (quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option)
VALUES 
    (1, 'What does NCC stand for?', 'National Cadet Corps', 'National Civic Corps', 'National Cadet Council', 'National Civil Corps', 0),
    (1, 'When was the NCC established in India?', '1947', '1948', '1950', '1952', 1),
    (2, 'What is the primary aircraft used for basic flying training in NCC Air Wing?', 'Super Dimona', 'Piper Cub', 'Zen Air', 'Cessna 152', 0),
    (3, 'What is the frequency range allocated for RC aircraft models used in AIVSC competitions?', '27 MHz', '35 MHz', '72 MHz', 'All of the above', 3);