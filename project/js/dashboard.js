// Dashboard Module for NCC Quiz Portal
document.addEventListener('DOMContentLoaded', () => {
  // Display user's recent scores
  displayRecentScores();
  
  // Setup difficulty buttons
  setupDifficultyButtons();
});



// Display user's recent scores
function displayRecentScores() {
  const currentUser = auth.getCurrentUser();
  const recentScores = document.getElementById('recentScores');
  
  if (!currentUser) {
    return;
  }
  
  const scores = auth.getUserScores(currentUser.username);
  
  if (scores.length === 0) {
    recentScores.innerHTML = '<p class="no-scores">No recent quiz attempts found.</p>';
    return;
  }
  
  // Sort scores by date (most recent first)
  const sortedScores = scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Display only the 5 most recent scores
  const recentFiveScores = sortedScores.slice(0, 5);
  
  recentScores.innerHTML = '';
  
  recentFiveScores.forEach(score => {
    const scoreCard = document.createElement('div');
    scoreCard.className = 'score-card';
    
    // Format date
    const scoreDate = new Date(score.date);
    const formattedDate = scoreDate.toLocaleDateString() + ' ' + scoreDate.toLocaleTimeString();
    
    scoreCard.innerHTML = `
      <div class="quiz-info">
        <h4>${capitalizeFirstLetter(score.difficulty)} - Set ${score.setNumber}</h4>
        <p>${formattedDate}</p>
      </div>
      <div class="score-value">${score.percentage}%</div>
    `;
    
    recentScores.appendChild(scoreCard);
  });
}

// Setup difficulty buttons
function setupDifficultyButtons() {
  const difficultyButtons = document.querySelectorAll('.btn-difficulty');
  const quizSets = document.getElementById('quizSets');
  const selectedDifficulty = document.getElementById('selectedDifficulty');
  const quizGrid = document.getElementById('quizGrid');
  
  difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      difficultyButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Get selected difficulty
      const difficulty = button.dataset.difficulty;
      
      // Update selected difficulty text
      selectedDifficulty.textContent = capitalizeFirstLetter(difficulty);
      
      // Show quiz sets
      quizSets.classList.remove('hidden');
      
      // Generate quiz set cards
      generateQuizSetCards(difficulty, quizGrid);
    });
  });
}

// Generate quiz set cards
function generateQuizSetCards(difficulty, container) {
  container.innerHTML = '';
  
  const currentUser = auth.getCurrentUser();
  const userScores = auth.getUserScores(currentUser.username);
  
  // Create 10 quiz set cards
  for (let i = 1; i <= 10; i++) {
    const card = document.createElement('div');
    card.className = 'quiz-set-card';
    
    // Check if user has completed this quiz
    const completedQuiz = userScores.find(score => 
      score.difficulty === difficulty && score.setNumber === i
    );
    
    if (completedQuiz) {
      card.classList.add('completed');
    }
    
    card.innerHTML = `
      <h4>Quiz Set ${i}</h4>
      <p>50 Questions</p>
      ${completedQuiz ? `<p class="score">Score: ${completedQuiz.percentage}%</p>` : ''}
    `;
    
    // Add click event to start quiz
    card.addEventListener('click', () => {
      // Store selected quiz information in sessionStorage
      sessionStorage.setItem('selectedQuiz', JSON.stringify({
        difficulty,
        setNumber: i
      }));
      
      // Navigate to quiz page
      window.location.href = 'quiz.html';
    });
    
    container.appendChild(card);
  }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}