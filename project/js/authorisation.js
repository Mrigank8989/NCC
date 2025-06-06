const USERS_KEY = 'ncc_quiz_users';
const AUTH_KEY = 'ncc_quiz_auth';

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const registerLink = document.getElementById("registerLink");
  const loginLink = document.getElementById("loginLink");

  const loginContainer = document.querySelector(".login-form");
  const registerContainer = document.querySelector(".register-form");

  // Toggle between login and register forms
  registerLink?.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.classList.add("hidden");
    registerContainer.classList.remove("hidden");
  });

  loginLink?.addEventListener("click", (e) => {
    e.preventDefault();
    registerContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  });

  // Handle login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:5000/api/SignIn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        alert("Login successful!");

        const user = {
          user_id: data.user.user_id,
          full_name: data.user.full_name,
          username: data.user.username,
          is_admin: data.user.is_admin,
          accessToken: data.token
        };

        // Save entire user object including token under AUTH_KEY
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));

        // Redirect to dashboard
        window.location.href = "/dashboard.html";
      } else {
        alert("Login failed: " + (data.message || "Invalid credentials"));
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong during login.");
    }
  });

  // Handle registration form submission
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("fullName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      const response = await fetch("http://localhost:5000/api/SignUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          full_name,
          password,
          is_admin: false
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registered successfully! Please login.");
        registerContainer.classList.add("hidden");
        loginContainer.classList.remove("hidden");
      } else {
        alert("Registration failed: " + data.message);
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Something went wrong during registration.");
    }
  });

  // Handle logout button click
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem(AUTH_KEY);
    alert("You have been logged out.");
    window.location.href = 'index.html'; // redirect after logout
  });
});

// --- Auth & Quiz Score Module ---

function getLoggedInUser() {
  const auth = localStorage.getItem(AUTH_KEY);
  return auth ? JSON.parse(auth) : null;
}

function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  alert("You have been logged out.");
  window.location.href = 'index.html';
}


document.addEventListener("DOMContentLoaded", () => {
  const auth = localStorage.getItem(AUTH_KEY);
  const userDisplay = document.getElementById('userDisplay');
  const logoutBtn = document.getElementById('logoutBtn');

  // Redirect to login page if no user is logged in
  if (!auth) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const user = JSON.parse(auth);
    // Display user's full name
    if (userDisplay) {
      userDisplay.textContent = user.full_name || user.username || "User";
    }

    // Handle logout button
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(AUTH_KEY);
        alert("You have been logged out.");
        window.location.href = 'index.html';
      });
    }

  } catch (err) {
    console.error("Invalid auth data", err);
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
  }
});


function getCurrentUser() {
  if (!isLoggedIn()) {
    return null;
  }
  
  return JSON.parse(localStorage.getItem(AUTH_KEY));
}



function saveQuizScore(quizData) {
  const user = getLoggedInUser();
  if (!user) return alert("No user logged in.");

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || {};

  if (!users[user.username]) {
    users[user.username] = {
      fullName: user.full_name || '',
      quizzesTaken: []
    };
  }

  users[user.username].quizzesTaken.push({
    difficulty: quizData.difficulty,
    setNumber: quizData.setNumber,
    score: quizData.score,
    totalQuestions: quizData.totalQuestions,
    percentage: quizData.percentage,
    date: new Date().toISOString()
  });

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

function getUserScores() {
  const user = getLoggedInUser();
  if (!user) return [];
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  return users[user.username]?.quizzesTaken || [];
}

function getAllScores() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  const allScores = [];

  Object.keys(users).forEach(username => {
    (users[username].quizzesTaken || []).forEach(quiz => {
      allScores.push({
        username,
        fullName: users[username].fullName || '',
        ...quiz
      });
    });
  });

  return allScores.sort((a, b) => new Date(b.date) - new Date(a.date));
}
// Check if user is logged in with accessToken on dashboard load

// Export to global scope
window.auth = {
  logoutUser,
  getLoggedInUser,
  saveQuizScore,
  getUserScores,
  getAllScores
};
