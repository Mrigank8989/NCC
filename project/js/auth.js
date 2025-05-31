// Auth Module for NCC Quiz Portal
const AUTH_KEY = 'ncc_quiz_auth';
const USERS_KEY = 'ncc_quiz_users';

// Initialize users if not exists
function initUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    const initialUsers = {
      admin: {
        username: 'admin',
        password: 'admin123', // In a real app, this would be hashed
        fullName: 'Admin User',
        isAdmin: true,
        quizzesTaken: [],
      }
    };
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
}

// Get users from localStorage
function getUsers() {
  initUsers();
  return JSON.parse(localStorage.getItem(USERS_KEY));
}

// Save users to localStorage
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Register a new user
function registerUser(username, password, fullName) {
  const users = getUsers();
  
  // Check if username already exists
  if (users[username]) {
    return {
      success: false,
      message: 'Username already exists'
    };
  }
  
  // Create new user
  users[username] = {
    username,
    password, // In a real app, this would be hashed
    fullName,
    isAdmin: false,
    quizzesTaken: []
  };
  
  saveUsers(users);
  
  return {
    success: true,
    message: 'Registration successful'
  };
}

// Login user
function loginUser(username, password) {
  const users = getUsers();
  
  // Check if user exists
  if (!users[username]) {
    return {
      success: false,
      message: 'User not found'
    };
  }
  
  // Check password
  if (users[username].password !== password) {
    return {
      success: false,
      message: 'Incorrect password'
    };
  }
  
  // Set current user in localStorage
  const userData = {
    username,
    fullName: users[username].fullName,
    isAdmin: users[username].isAdmin
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  
  return {
    success: true,
    message: 'Login successful',
    user: userData
  };
}

// Logout user
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'index.html';
}

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem(AUTH_KEY);
}

// Get current user
function getCurrentUser() {
  if (!isLoggedIn()) {
    return null;
  }
  
  return JSON.parse(localStorage.getItem(AUTH_KEY));
}

// Check if user is admin
function isAdmin() {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.isAdmin;
}

// Add a new quiz score for a user
function saveQuizScore(username, quizData) {
  const users = getUsers();
  
  if (!users[username]) {
    return false;
  }
  
  // Add quiz score
  users[username].quizzesTaken.push({
    difficulty: quizData.difficulty,
    setNumber: quizData.setNumber,
    score: quizData.score,
    totalQuestions: quizData.totalQuestions,
    percentage: quizData.percentage,
    date: new Date().toISOString()
  });
  
  saveUsers(users);
  return true;
}

// Get user's quiz scores
function getUserScores(username) {
  const users = getUsers();
  
  if (!users[username]) {
    return [];
  }
  
  return users[username].quizzesTaken;
}

// Get all users' scores (admin only)
function getAllScores() {
  const users = getUsers();
  const allScores = [];
  
  Object.keys(users).forEach(username => {
    const user = users[username];
    
    user.quizzesTaken.forEach(quiz => {
      allScores.push({
        username,
        fullName: user.fullName,
        ...quiz
      });
    });
  });
  
  // Sort by date (most recent first)
  return allScores.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Initialize authentication
function initAuth() {
  // Initialize users if not exists
  initUsers();
  
  // Check if we're on the login page
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    setupLoginPage();
  } else {
    // Check authentication for other pages
    if (!isLoggedIn()) {
      window.location.href = 'index.html';
      return;
    }
    
    // Check if admin access is required
    if (window.location.pathname.endsWith('admin.html') && !isAdmin()) {
      window.location.href = 'dashboard.html';
      return;
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logoutUser);
    }
    
    // Display user info
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
      const currentUser = getCurrentUser();
      userDisplay.textContent = currentUser.fullName;
    }
    
    // Display welcome message
    const welcomeUser = document.getElementById('welcomeUser');
    if (welcomeUser) {
      const currentUser = getCurrentUser();
      welcomeUser.textContent = currentUser.fullName;
    }
  }
}

// Setup login page
function setupLoginPage() {
  // If already logged in, redirect to dashboard
  if (isLoggedIn()) {
    const currentUser = getCurrentUser();
    if (currentUser.isAdmin) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
    return;
  }
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const registerLink = document.getElementById('registerLink');
  const loginLink = document.getElementById('loginLink');
  
  // Toggle between login and register forms
  registerLink.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('.login-form').classList.add('hidden');
    document.querySelector('.register-form').classList.remove('hidden');
  });
  
  loginLink.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('.register-form').classList.add('hidden');
    document.querySelector('.login-form').classList.remove('hidden');
  });
  
  // Handle login form submission
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const result = loginUser(username, password);
    
    if (result.success) {
      if (result.user.isAdmin) {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      alert(result.message);
    }
  });
  
  // Handle register form submission
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate password match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    const result = registerUser(username, password, fullName);
    
    if (result.success) {
      alert('Registration successful! You can now login.');
      document.querySelector('.register-form').classList.add('hidden');
      document.querySelector('.login-form').classList.remove('hidden');
    } else {
      alert(result.message);
    }
  });
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

// Export authentication functions
window.auth = {
  isLoggedIn,
  getCurrentUser,
  isAdmin,
  saveQuizScore,
  getUserScores,
  getAllScores,
  logoutUser
};