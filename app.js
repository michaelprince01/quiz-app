const startButton = document.querySelector('.start-btn');
const quizContainer = document.querySelector('.quiz');
const questionElement = document.querySelector('.question');
const answerButtons = document.querySelector('.answer-buttons');
const nextButton = document.querySelector('.next-btn');
const timerElement = document.querySelector('.timer');
const progressBar = document.querySelector('.progress-bar');
const views = document.querySelector('.views');

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 6;
let questions = [];

// Start the quiz when the "Start Quiz" button is clicked
startButton.addEventListener('click', startQuiz);

// Load questions from the JSON file
async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    if (!response.ok) {
      throw new Error('Failed to load questions.json');
    }
    questions = await response.json();
    shuffleQuestions(); // Shuffle questions after loading
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

// Shuffle the questions array to randomize the order
function shuffleQuestions() {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]]; // Swap elements
  }
}

// Start the quiz
async function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  startButton.style.display = 'none';
  quizContainer.style.display = 'block';
  views.style.display = 'flex';
  timeLeft = 6;
  progressBar.style.width = '0%';
  await loadQuestions();
  showQuestion();
  startTimer();
}

// Show the current question and answers
function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  const questionNo = currentQuestionIndex + 1;
  questionElement.innerHTML = `${questionNo}. ${currentQuestion.question}`;
  currentQuestion.answers.forEach((answer) => {
    const button = document.createElement('button');
    button.innerHTML = answer.text;
    button.classList.add('btn');
    answerButtons.appendChild(button);
    if (answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener('click', selectAnswer);
  });
}

// Reset the state after answering a question
function resetState() {
  nextButton.style.display = 'none';
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

// Handle answer selection
function selectAnswer(e) {
  const selectedBtn = e.target;
  const isCorrect = selectedBtn.dataset.correct === 'true';
  if (isCorrect) {
    selectedBtn.classList.add('correct');
    score++;
  } else {
    selectedBtn.classList.add('incorrect');
  }
  Array.from(answerButtons.children).forEach((button) => {
    if (button.dataset.correct === 'true') {
      button.classList.add('correct');
    }
    button.disabled = true;
  });
  nextButton.style.display = 'block';
  stopTimer();
}

// Start the timer for each question
function startTimer() {
  timerElement.textContent = `${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
      stopTimer();
      nextButton.style.display = 'block';
      handleNextButton();
    } else {
      timerElement.textContent = `${timeLeft}s`;
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timer);
}

// Handle the next button click
function handleNextButton() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
    progressBar.style.width = `${
      (currentQuestionIndex / questions.length) * 100
    }%`; // Update progress bar
    timeLeft = 6; // Reset time for next question
    startTimer(); // Restart the timer for the next question
  } else {
    showScore();
  }
}

// Show the final score
function showScore() {
  resetState();
  questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
  questionElement.style.textAlign = 'center';
  views.style.display = 'none';
  nextButton.innerHTML = 'Play Again';
  nextButton.style.display = 'block';
}

// Play Again button to restart the quiz
nextButton.addEventListener('click', () => {
  if (currentQuestionIndex < questions.length) {
    handleNextButton();
  } else {
    startQuiz();
  }
});
