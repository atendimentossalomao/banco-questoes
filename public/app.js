let questions = [];
let currentIndex = 0;
let score = 0;
let answered = false;

const loadingEl = document.getElementById('loading');
const quizEl = document.getElementById('quiz');
const resultEl = document.getElementById('result');
const progressTextEl = document.getElementById('progress-text');
const scoreTextEl = document.getElementById('score-text');
const materiaEl = document.getElementById('materia');
const questionTextEl = document.getElementById('question-text');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const feedbackTextEl = document.getElementById('feedback-text');
const explanationEl = document.getElementById('explanation');
const nextBtn = document.getElementById('next-btn');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

async function loadQuestions() {
  try {
    const res = await fetch('./questions.json');
    questions = await res.json();
    loadingEl.classList.add('hidden');
    quizEl.classList.remove('hidden');
    renderQuestion();
  } catch (err) {
    loadingEl.textContent = 'Erro ao carregar questões.';
    console.error(err);
  }
}

function renderQuestion() {
  answered = false;
  const q = questions[currentIndex];

  progressTextEl.textContent = `Questão ${currentIndex + 1} de ${questions.length}`;
  scoreTextEl.textContent = `Acertos: ${score}`;
  materiaEl.textContent = q.materia;
  questionTextEl.textContent = q.question;

  optionsEl.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = `${String.fromCharCode(65 + i)}) ${opt}`;
    btn.addEventListener('click', () => selectAnswer(i));
    optionsEl.appendChild(btn);
  });

  feedbackEl.classList.add('hidden');
  nextBtn.classList.add('hidden');
}

function selectAnswer(selected) {
  if (answered) return;
  answered = true;

  const q = questions[currentIndex];
  const buttons = optionsEl.querySelectorAll('.option');

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add('correct');
    if (i === selected && i !== q.answer) btn.classList.add('wrong');
  });

  if (selected === q.answer) {
    score++;
    feedbackTextEl.textContent = '✅ Resposta correta!';
    feedbackTextEl.style.color = '#27ae60';
  } else {
    feedbackTextEl.textContent = '❌ Resposta incorreta.';
    feedbackTextEl.style.color = '#e74c3c';
  }

  explanationEl.textContent = q.explanation || '';
  feedbackEl.classList.remove('hidden');
  scoreTextEl.textContent = `Acertos: ${score}`;

  nextBtn.classList.remove('hidden');
  nextBtn.textContent = currentIndex === questions.length - 1 ? 'Ver resultado' : 'Próxima';
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  quizEl.classList.add('hidden');
  resultEl.classList.remove('hidden');
  const pct = Math.round((score / questions.length) * 100);
  finalScoreEl.textContent = `Você acertou ${score} de ${questions.length} (${pct}%)`;
}

function restart() {
  currentIndex = 0;
  score = 0;
  resultEl.classList.add('hidden');
  quizEl.classList.remove('hidden');
  renderQuestion();
}

nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restart);

loadQuestions();