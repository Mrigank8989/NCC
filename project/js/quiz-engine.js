// Quiz Engine Module for NCC Quiz Portal
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timer = null;
let startTime = null;
let timeElapsed = 0;

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeQuiz();
});

// Initialize the quiz
function initializeQuiz() {
  // Get selected quiz from sessionStorage
  const selectedQuiz = JSON.parse(sessionStorage.getItem('selectedQuiz'));
  
  if (!selectedQuiz) {
    // If no quiz selected, redirect to dashboard
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Get quiz questions
  const questions = quizData.getQuizQuestions(selectedQuiz.difficulty, selectedQuiz.setNumber);
  
  if (!questions || questions.length === 0) {
    alert('Failed to load quiz questions. Please try again.');
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Initialize current quiz
  currentQuiz = {
    difficulty: selectedQuiz.difficulty,
    setNumber: selectedQuiz.setNumber,
    questions: questions,
    totalQuestions: questions.length
  };
  
  // Initialize user answers array with null values (unanswered)
  userAnswers = Array(currentQuiz.totalQuestions).fill(null);
  
  // Update quiz title
  document.getElementById('quizTitle').textContent = 
    `${capitalizeFirstLetter(currentQuiz.difficulty)} - Quiz Set ${currentQuiz.setNumber}`;
  
  // Show first question
  showQuestion(0);
  
  // Initialize quiz controls
  initializeControls();
  
  // Start timer
  startTimer();
}

// Show the current question
function showQuestion(index) {
  if (!currentQuiz || index < 0 || index >= currentQuiz.totalQuestions) {
    return;
  }
  
  currentQuestionIndex = index;
  const question = currentQuiz.questions[index];
  
  // Update question counter
  document.getElementById('questionCounter').textContent = 
    `Question ${index + 1} of ${currentQuiz.totalQuestions}`;
  
  // Update progress bar
  const progressPercentage = ((index + 1) / currentQuiz.totalQuestions) * 100;
  document.getElementById('progressBar').style.width = `${progressPercentage}%`;
  
  // Update question text
  document.getElementById('questionText').textContent = question.question;
  
  // Clear previous options
  const optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = '';
  
  // Add options
  question.options.forEach((option, optionIndex) => {
    const optionElement = document.createElement('div');
    optionElement.className = 'option';
    
    // Check if this option was previously selected
    if (userAnswers[index] === optionIndex) {
      optionElement.classList.add('selected');
    }
    
    optionElement.innerHTML = `<span class="option-text">${option}</span>`;
    
    // Add click event to select option
    optionElement.addEventListener('click', () => {
      selectOption(optionIndex);
    });
    
    optionsContainer.appendChild(optionElement);
  });
  
  // Update button states
  updateButtonStates();
  
  // Add fade-in animation
  const questionContainer = document.getElementById('questionContainer');
  questionContainer.classList.add('fade-out');
  
  // Use setTimeout to allow animation to complete
  setTimeout(() => {
    questionContainer.classList.remove('fade-out');
    questionContainer.classList.add('fade-in');
    
    setTimeout(() => {
      questionContainer.classList.remove('fade-in');
    }, 300);
  }, 150);
}

// Select an option for the current question
function selectOption(optionIndex) {
  // Save the user's answer
  userAnswers[currentQuestionIndex] = optionIndex;
  
  // Update option UI
  const options = document.querySelectorAll('.option');
  options.forEach((option, index) => {
    if (index === optionIndex) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
  
  // Update score display
  updateScore();
}

// Update score display
function updateScore() {
  const score = calculateScore();
  document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

// Calculate current score
function calculateScore() {
  let score = 0;
  
  userAnswers.forEach((answer, index) => {
    if (answer !== null && answer === currentQuiz.questions[index].answer) {
      score++;
    }
  });
  
  return score;
}

// Initialize quiz controls
function initializeControls() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  // Previous button
  prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      showQuestion(currentQuestionIndex - 1);
    }
  });
  
  // Next button
  nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuiz.totalQuestions - 1) {
      showQuestion(currentQuestionIndex + 1);
    }
  });
  
  // Submit button
  submitBtn.addEventListener('click', () => {
    const unansweredCount = userAnswers.filter(answer => answer === null).length;
    
    if (unansweredCount > 0) {
      const confirmSubmit = confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
      
      if (!confirmSubmit) {
        return;
      }
    } else {
      const confirmSubmit = confirm('Are you sure you want to submit your quiz?');
      
      if (!confirmSubmit) {
        return;
      }
    }
    
    finishQuiz();
  });
  
  // Update button states initially
  updateButtonStates();
}

// Update button states based on current question
function updateButtonStates() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  // Disable previous button on first question
  if (currentQuestionIndex === 0) {
    prevBtn.classList.add('disabled');
  } else {
    prevBtn.classList.remove('disabled');
  }
  
  // Show submit button on last question, otherwise show next button
  if (currentQuestionIndex === currentQuiz.totalQuestions - 1) {
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
  }
}

// Start the quiz timer
function startTimer() {
  startTime = new Date();
  
  timer = setInterval(() => {
    const currentTime = new Date();
    timeElapsed = Math.floor((currentTime - startTime) / 1000);
    
    const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
    const seconds = (timeElapsed % 60).toString().padStart(2, '0');
    
    document.getElementById('timer').textContent = `Time: ${minutes}:${seconds}`;
  }, 1000);
}

// Stop the quiz timer
function stopTimer() {
  clearInterval(timer);
}

// Finish the quiz
function finishQuiz() {
  // Stop the timer
  stopTimer();
  
  // Calculate final score
  const score = calculateScore();
  const totalQuestions = currentQuiz.totalQuestions;
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Hide quiz container and show result container
  document.getElementById('questionContainer').classList.add('hidden');
  document.getElementById('quizControls').classList.add('hidden');
  
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.classList.remove('hidden');
  
  // Update result elements
  document.getElementById('finalScore').textContent = score;
  document.getElementById('totalQuestions').textContent = totalQuestions;
  document.getElementById('scorePercentage').textContent = `${percentage}%`;
  document.getElementById('correctAnswers').textContent = score;
  document.getElementById('incorrectAnswers').textContent = totalQuestions - score - getUnansweredCount();
  document.getElementById('unansweredQuestions').textContent = getUnansweredCount();
  
  // Format time taken
  const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
  const seconds = (timeElapsed % 60).toString().padStart(2, '0');
  document.getElementById('timeTaken').textContent = `${minutes}:${seconds}`;
  
  // Add animation to score circle
  const scoreCircle = document.querySelector('.score-circle');
  scoreCircle.style.setProperty('--score-percentage', `${percentage}%`);
  
  setTimeout(() => {
    scoreCircle.classList.add('animate');
  }, 500);
  
  // Setup result buttons
  document.getElementById('reviewBtn').addEventListener('click', reviewQuiz);
  document.getElementById('dashboardBtn').addEventListener('click', returnToDashboard);
  
  // Save quiz result
  saveQuizResult(score, totalQuestions, percentage);
}

// Count unanswered questions
function getUnansweredCount() {
  return userAnswers.filter(answer => answer === null).length;
}

// Save quiz result
function saveQuizResult(score, totalQuestions, percentage) {
  const currentUser = auth.getCurrentUser();
  
  if (!currentUser) {
    console.error('User not logged in');
    return;
  }
  
  const quizData = {
    difficulty: currentQuiz.difficulty,
    setNumber: currentQuiz.setNumber,
    score: score,
    totalQuestions: totalQuestions,
    percentage: percentage
  };
  
  auth.saveQuizScore(currentUser.username, quizData);
}

// Review quiz answers
function reviewQuiz() {
  // Hide result container
  document.getElementById('resultContainer').classList.add('hidden');
  
  // Show question container and controls
  document.getElementById('questionContainer').classList.remove('hidden');
  document.getElementById('quizControls').classList.remove('hidden');
  
  // Disable all options
  document.querySelectorAll('.option').forEach(option => {
    option.style.pointerEvents = 'none';
  });
  
  // Show correct and incorrect answers
  showAnswers();
  
  // Update buttons for review mode
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  prevBtn.classList.remove('disabled');
  nextBtn.classList.remove('hidden');
  submitBtn.classList.add('hidden');
  
  prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      showQuestion(currentQuestionIndex - 1);
      showAnswers();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuiz.totalQuestions - 1) {
      showQuestion(currentQuestionIndex + 1);
      showAnswers();
    } else {
      // Return to results when reaching the end
      document.getElementById('questionContainer').classList.add('hidden');
      document.getElementById('quizControls').classList.add('hidden');
      document.getElementById('resultContainer').classList.remove('hidden');
    }
  });
}

// Show correct and incorrect answers
function showAnswers() {
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const correctAnswerIndex = currentQuestion.answer;
  const userAnswerIndex = userAnswers[currentQuestionIndex];
  
  const options = document.querySelectorAll('.option');
  
  options.forEach((option, index) => {
    // Remove any existing classes
    option.classList.remove('correct', 'incorrect');
    
    // Mark correct answer
    if (index === correctAnswerIndex) {
      option.classList.add('correct');
    }
    
    // Mark user's incorrect answer
    if (userAnswerIndex !== null && index === userAnswerIndex && index !== correctAnswerIndex) {
      option.classList.add('incorrect');
    }
  });
}

// Return to dashboard
function returnToDashboard() {
  window.location.href = 'dashboard.html';
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}