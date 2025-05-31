// Quiz Data Module for NCC Quiz Portal
// This file contains all the quiz questions organized by difficulty

// Utility function to shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Quiz questions organized by difficulty and set number
const allQuizQuestions = {
  easy: {
    1: [
      {
        question: "What does NCC stand for?",
        options: ["National Cadet Corps", "National Civic Corps", "National Cadet Council", "National Civil Corps"],
        answer: 0
      },
      {
        question: "When was the NCC established in India?",
        options: ["1947", "1948", "1950", "1952"],
        answer: 1
      },
      {
        question: "What is the motto of NCC?",
        options: ["Service Before Self", "Unity and Discipline", "Duty, Honor, Country", "Unity, Discipline and Leadership"],
        answer: 1
      },
      {
        question: "Who was the first Director General of NCC?",
        options: ["Major General Enaith Habibullah", "Major General Himmat Singh", "Major General K.S. Thimayya", "Major General S.P.P Thorat"],
        answer: 0
      },
      {
        question: "Which of the following is the emblem of NCC?",
        options: ["Ashoka Chakra", "Ashoka Lion", "Lotus with Tricolor", "Three colors representing Army, Navy and Air Force"],
        answer: 3
      },
      // Add 45 more questions for easy set 1
    ],
    2: [
      {
        question: "The All India Vayu Sainik Camp (AIVSC) is an annual camp for which wing of NCC?",
        options: ["Army", "Navy", "Air Force", "Combined Wings"],
        answer: 2
      },
      // Add 49 more questions for easy set 2
    ]
    // Add sets 3-10 with 50 questions each
  },
  intermediate: {
    1: [
      {
        question: "What is the primary aircraft used for basic flying training in NCC Air Wing?",
        options: ["Super Dimona", "Piper Cub", "Zen Air", "Cessna 152"],
        answer: 0
      },
      {
        question: "How many directorates of NCC have the Air Wing component?",
        options: ["5", "10", "17", "25"],
        answer: 2
      },
      {
        question: "Which of the following is NOT a part of AIVSC competitions?",
        options: ["Skeet Shooting", "Drill", "Aero Modeling", "Flying"],
        answer: 3
      },
      {
        question: "What is the minimum attendance percentage required for NCC cadets to appear for B certificate?",
        options: ["60%", "70%", "75%", "80%"],
        answer: 2
      },
      {
        question: "During AIVSC, what is the distance for the firing competition?",
        options: ["25 meters", "50 meters", "100 meters", "200 meters"],
        answer: 0
      },
      // Add 45 more questions for intermediate set 1
    ],
    2: [
      {
        question: "The Directorate responsible for Air Wing cadets in the Eastern region is located at?",
        options: ["Kolkata", "Patna", "Ranchi", "Guwahati"],
        answer: 0
      },
      // Add 49 more questions for intermediate set 2
    ]
    // Add sets 3-10 with 50 questions each
  },
  hard: {
    1: [
      {
        question: "What is the frequency range allocated for RC aircraft models used in AIVSC competitions?",
        options: ["27 MHz", "35 MHz", "72 MHz", "All of the above"],
        answer: 3
      },
      {
        question: "Which type of engine is commonly used in Control Line Speed models during AIVSC?",
        options: ["Glow Plug", "Diesel", "Electric", "Both A and B"],
        answer: 0
      },
      {
        question: "What is the minimum time that the Free Flight model should remain airborne during AIVSC competition?",
        options: ["30 seconds", "45 seconds", "60 seconds", "90 seconds"],
        answer: 2
      },
      {
        question: "The Control Line Speed competition involves flying the model for how many laps?",
        options: ["5 laps", "7 laps", "9 laps", "10 laps"],
        answer: 2
      },
      {
        question: "What is the standard engine capacity used in RC Powered models in AIVSC?",
        options: ["0.5-1.0 cc", "1.5-2.5 cc", "3.0-5.0 cc", "6.5-8.5 cc"],
        answer: 2
      },
      // Add 45 more questions for hard set 1
    ],
    2: [
      {
        question: "What is the fuel mixture commonly used in glow plug engines for aero modeling?",
        options: ["Methanol + Nitromethane + Oil", "Gasoline + Oil", "Kerosene + Oil", "Diesel + Ether"],
        answer: 0
      },
      // Add 49 more questions for hard set 2
    ]
    // Add sets 3-10 with 50 questions each
  }
};

// Function to get quiz questions
function getQuizQuestions(difficulty, setNumber) {
  // Validate parameters
  if (!allQuizQuestions[difficulty] || !allQuizQuestions[difficulty][setNumber]) {
    console.error(`Quiz not found: ${difficulty} - Set ${setNumber}`);
    return null;
  }
  
  // Get questions and shuffle options
  const questions = [...allQuizQuestions[difficulty][setNumber]];
  
  // Shuffle the questions
  const shuffledQuestions = shuffleArray(questions);
  
  // For each question, shuffle the options while preserving the correct answer
  shuffledQuestions.forEach(question => {
    const correctAnswer = question.options[question.answer];
    question.options = shuffleArray([...question.options]);
    question.answer = question.options.indexOf(correctAnswer);
  });
  
  return shuffledQuestions;
}

// Export the quiz functionality
window.quizData = {
  getQuizQuestions: getQuizQuestions
};