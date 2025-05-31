// Admin Module for NCC Quiz Portal
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is admin
  if (!auth.isAdmin()) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Initialize admin panel
  initAdminPanel();
});

// Initialize admin panel
function initAdminPanel() {
  // Setup tab navigation
  setupTabs();
  
  // Load user scores
  loadUserScores();
  
  // Load user management
  loadUserManagement();
  
  // Load quiz statistics
  loadQuizStatistics();
}

// Setup tab navigation
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show corresponding tab content
      const tabId = button.dataset.tab;
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Load user scores
function loadUserScores() {
  const scoresTableBody = document.getElementById('scoresTableBody');
  const userFilter = document.getElementById('userFilter');
  
  // Get all scores
  const allScores = auth.getAllScores();
  
  // Clear table body
  scoresTableBody.innerHTML = '';
  
  // Populate user filter dropdown
  populateUserFilter(userFilter, allScores);
  
  // Populate scores table
  populateScoresTable(scoresTableBody, allScores);
  
  // Setup filter button
  document.getElementById('applyFilterBtn').addEventListener('click', () => {
    applyScoresFilter();
  });
}

// Populate user filter dropdown
function populateUserFilter(userFilter, scores) {
  // Get unique usernames
  const usernames = [...new Set(scores.map(score => score.username))];
  
  // Clear dropdown options except 'All Users'
  userFilter.innerHTML = '<option value="all">All Users</option>';
  
  // Add username options
  usernames.forEach(username => {
    // Skip admin user
    if (username === 'admin') {
      return;
    }
    
    const option = document.createElement('option');
    option.value = username;
    option.textContent = username;
    userFilter.appendChild(option);
  });
}

// Populate scores table
function populateScoresTable(tableBody, scores) {
  // Clear table body
  tableBody.innerHTML = '';
  
  if (scores.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" class="text-center">No scores found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  // Add scores to table
  scores.forEach(score => {
    const row = document.createElement('tr');
    
    // Format date
    const scoreDate = new Date(score.date);
    const formattedDate = scoreDate.toLocaleDateString() + ' ' + scoreDate.toLocaleTimeString();
    
    row.innerHTML = `
      <td>${score.username}</td>
      <td>Set ${score.setNumber}</td>
      <td>${capitalizeFirstLetter(score.difficulty)}</td>
      <td>${score.score}/${score.totalQuestions}</td>
      <td>${score.percentage}%</td>
      <td>${formattedDate}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view-btn" data-username="${score.username}" data-set="${score.setNumber}" data-difficulty="${score.difficulty}">View</button>
          <button class="action-btn delete-btn" data-username="${score.username}" data-date="${score.date}">Delete</button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to action buttons
  addScoreActionListeners();
}

// Add event listeners to score action buttons
function addScoreActionListeners() {
  // View button
  document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', () => {
      const username = button.dataset.username;
      const setNumber = button.dataset.set;
      const difficulty = button.dataset.difficulty;
      
      alert(`View score details for ${username} - ${capitalizeFirstLetter(difficulty)} Set ${setNumber}`);
      // In a real application, this would open a modal with detailed score information
    });
  });
  
  // Delete button
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const username = button.dataset.username;
      const date = button.dataset.date;
      
      const confirmDelete = confirm(`Are you sure you want to delete this score record for ${username}?`);
      
      if (confirmDelete) {
        deleteScore(username, date);
      }
    });
  });
}

// Delete a score record
function deleteScore(username, date) {
  // Get users
  const users = JSON.parse(localStorage.getItem('ncc_quiz_users'));
  
  if (!users || !users[username]) {
    alert('User not found');
    return;
  }
  
  // Find and remove score
  const userScores = users[username].quizzesTaken;
  const scoreIndex = userScores.findIndex(score => score.date === date);
  
  if (scoreIndex === -1) {
    alert('Score record not found');
    return;
  }
  
  // Remove score
  userScores.splice(scoreIndex, 1);
  
  // Save updated users
  localStorage.setItem('ncc_quiz_users', JSON.stringify(users));
  
  // Reload scores
  loadUserScores();
  loadQuizStatistics();
  
  alert('Score record deleted successfully');
}

// Apply scores filter
function applyScoresFilter() {
  const userFilter = document.getElementById('userFilter').value;
  const difficultyFilter = document.getElementById('difficultyFilter').value;
  
  // Get all scores
  let filteredScores = auth.getAllScores();
  
  // Apply user filter
  if (userFilter !== 'all') {
    filteredScores = filteredScores.filter(score => score.username === userFilter);
  }
  
  // Apply difficulty filter
  if (difficultyFilter !== 'all') {
    filteredScores = filteredScores.filter(score => score.difficulty === difficultyFilter);
  }
  
  // Update table
  populateScoresTable(document.getElementById('scoresTableBody'), filteredScores);
}

// Load user management
function loadUserManagement() {
  const userTableBody = document.getElementById('userTableBody');
  
  // Get all users
  const users = JSON.parse(localStorage.getItem('ncc_quiz_users'));
  
  if (!users) {
    return;
  }
  
  // Clear table body
  userTableBody.innerHTML = '';
  
  // Add users to table
  Object.keys(users).forEach(username => {
    // Skip admin user
    if (username === 'admin') {
      return;
    }
    
    const user = users[username];
    const quizzesTaken = user.quizzesTaken.length;
    
    // Calculate average score
    let avgScore = 0;
    if (quizzesTaken > 0) {
      const totalPercentage = user.quizzesTaken.reduce((sum, quiz) => sum + quiz.percentage, 0);
      avgScore = Math.round(totalPercentage / quizzesTaken);
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.fullName}</td>
      <td>${quizzesTaken}</td>
      <td>${avgScore}%</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view-btn" data-username="${user.username}">View</button>
          <button class="action-btn delete-btn" data-username="${user.username}">Delete</button>
        </div>
      </td>
    `;
    
    userTableBody.appendChild(row);
  });
  
  // Add event listeners to action buttons
  addUserActionListeners();
}

// Add event listeners to user action buttons
function addUserActionListeners() {
  // View button
  document.querySelectorAll('#userManagement .view-btn').forEach(button => {
    button.addEventListener('click', () => {
      const username = button.dataset.username;
      
      // Switch to scores tab and filter by user
      document.querySelector('.tab-btn[data-tab="userScores"]').click();
      document.getElementById('userFilter').value = username;
      applyScoresFilter();
    });
  });
  
  // Delete button
  document.querySelectorAll('#userManagement .delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const username = button.dataset.username;
      
      const confirmDelete = confirm(`Are you sure you want to delete user ${username}? This will delete all their quiz records.`);
      
      if (confirmDelete) {
        deleteUser(username);
      }
    });
  });
}

// Delete a user
function deleteUser(username) {
  // Get users
  const users = JSON.parse(localStorage.getItem('ncc_quiz_users'));
  
  if (!users || !users[username]) {
    alert('User not found');
    return;
  }
  
  // Delete user
  delete users[username];
  
  // Save updated users
  localStorage.setItem('ncc_quiz_users', JSON.stringify(users));
  
  // Reload users and scores
  loadUserManagement();
  loadUserScores();
  loadQuizStatistics();
  
  alert('User deleted successfully');
}

// Load quiz statistics
function loadQuizStatistics() {
  // Get all scores
  const allScores = auth.getAllScores();
  
  // Get all users
  const users = JSON.parse(localStorage.getItem('ncc_quiz_users'));
  
  if (!users) {
    return;
  }
  
  // Calculate statistics
  const totalAttempts = allScores.length;
  
  let avgScore = 0;
  if (totalAttempts > 0) {
    const totalPercentage = allScores.reduce((sum, score) => sum + score.percentage, 0);
    avgScore = Math.round(totalPercentage / totalAttempts);
  }
  
  let highestScore = 0;
  if (totalAttempts > 0) {
    highestScore = Math.max(...allScores.map(score => score.percentage));
  }
  
  const registeredUsers = Object.keys(users).filter(username => username !== 'admin').length;
  
  // Update statistics cards
  document.getElementById('totalAttempts').textContent = totalAttempts;
  document.getElementById('averageScore').textContent = `${avgScore}%`;
  document.getElementById('highestScore').textContent = `${highestScore}%`;
  document.getElementById('registeredUsers').textContent = registeredUsers;
  
  // Calculate difficulty statistics
  const easyScores = allScores.filter(score => score.difficulty === 'easy');
  const intermediateScores = allScores.filter(score => score.difficulty === 'intermediate');
  const hardScores = allScores.filter(score => score.difficulty === 'hard');
  
  let easyAvg = 0;
  if (easyScores.length > 0) {
    const totalPercentage = easyScores.reduce((sum, score) => sum + score.percentage, 0);
    easyAvg = Math.round(totalPercentage / easyScores.length);
  }
  
  let intermediateAvg = 0;
  if (intermediateScores.length > 0) {
    const totalPercentage = intermediateScores.reduce((sum, score) => sum + score.percentage, 0);
    intermediateAvg = Math.round(totalPercentage / intermediateScores.length);
  }
  
  let hardAvg = 0;
  if (hardScores.length > 0) {
    const totalPercentage = hardScores.reduce((sum, score) => sum + score.percentage, 0);
    hardAvg = Math.round(totalPercentage / hardScores.length);
  }
  
  // Update difficulty statistics
  document.getElementById('easyBar').style.width = `${easyAvg}%`;
  document.getElementById('easyAvg').textContent = `${easyAvg}%`;
  
  document.getElementById('intermediateBar').style.width = `${intermediateAvg}%`;
  document.getElementById('intermediateAvg').textContent = `${intermediateAvg}%`;
  
  document.getElementById('hardBar').style.width = `${hardAvg}%`;
  document.getElementById('hardAvg').textContent = `${hardAvg}%`;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}