// ===== ESTADO GLOBAL =====
let questions = [];
let currentIndex = 0;
let score = 0;
let answered = false;

// ===== REFERÊNCIAS AOS ELEMENTOS =====
const menuEl = document.getElementById('menu');
const quizEl = document.getElementById('quiz');
const resultEl = document.getElementById('result');
const cadastroEl = document.getElementById('cadastro');
const loadingEl = document.getElementById('loading');

const totalQuestoesEl = document.getElementById('total-questoes');
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
const mensagemCadastroEl = document.getElementById('mensagem-cadastro');

// ===== NAVEGAÇÃO ENTRE TELAS =====
function mostrarTela(nome) {
  [menuEl, quizEl, resultEl, cadastroEl, loadingEl].forEach(el => {
    el.classList.add('hidden');
  });
  document.getElementById(nome).classList.remove('hidden');
}

// ===== INICIALIZAÇÃO =====
async function iniciar() {
  mostrarTela('loading');
  try {
    const total = await supabase.contarQuestoes();
    totalQuestoesEl.textContent = total;
    mostrarTela('menu');
  } catch (err) {
    console.error(err);
    totalQuestoesEl.textContent = '0';
    mostrarTela('menu');
  }
}

// ===== MENU =====
document.getElementById('btn-simulado').addEventListener('click', iniciarSimulado);
document.getElementById('btn-cadastrar').addEventListener('click', () => {
  document.getElementById('form-cadastro').reset();
  mensagemCadastroEl.classList.add('hidden');
  mostrarTela('cadastro');
});

// ===== SIMULADO =====
async function iniciarSimulado() {
  mostrarTela('loading');
  try {
    questions = await supabase.buscarQuestoes();

    if (!questions || questions.length === 0) {
      alert('Nenhuma questão cadastrada ainda. Cadastre uma antes de começar.');
      mostrarTela('menu');
      return;
    }

    // Embaralhar
    questions = questions.sort(() => Math.random() - 0.5);

    currentIndex = 0;
    score = 0;
    mostrarTela('quiz');
    renderQuestion();
  } catch (err) {
    console.error(err);
    alert('Erro ao carregar questões: ' + err.message);
    mostrarTela('menu');
  }
}

function renderQuestion() {
  answered = false;
  const q = questions[currentIndex];

  progressTextEl.textContent = `Questão ${currentIndex + 1} de ${questions.length}`;
  scoreTextEl.textContent = `Acertos: ${score}`;
  materiaEl.textContent = q.materia;
  questionTextEl.textContent = q.enunciado;

  const opcoes = [
    q.alternativa_a,
    q.alternativa_b,
    q.alternativa_c,
    q.alternativa_d,
    q.alternativa_e
  ];

  optionsEl.innerHTML = '';
  opcoes.forEach((opt, i) => {
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
  const correta = q.resposta_correta;
  const buttons = optionsEl.querySelectorAll('.option');

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correta) btn.classList.add('correct');
    if (i === selected && i !== correta) btn.classList.add('wrong');
  });

  if (selected === correta) {
    score++;
    feedbackTextEl.textContent = '✅ Resposta correta!';
    feedbackTextEl.style.color = '#27ae60';
  } else {
    feedbackTextEl.textContent = '❌ Resposta incorreta.';
    feedbackTextEl.style.color = '#e74c3c';
  }

  explanationEl.textContent = q.explicacao || '';
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
  mostrarTela('result');
  const pct = Math.round((score / questions.length) * 100);
  finalScoreEl.textContent = `Você acertou ${score} de ${questions.length} (${pct}%)`;
}

function reiniciarSimulado() {
  currentIndex = 0;
  score = 0;
  mostrarTela('quiz');
  renderQuestion();
}

nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', reiniciarSimulado);
document.getElementById('voltar-menu-quiz').addEventListener('click', () => mostrarTela('menu'));
document.getElementById('voltar-menu-result').addEventListener('click', () => mostrarTela('menu'));

// ===== CADASTRO =====
document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btnSalvar = document.getElementById('btn-salvar');
  btnSalvar.disabled = true;
  btnSalvar.textContent = 'Salvando...';

  const questao = {
    materia: document.getElementById('cad-materia').value.trim(),
    enunciado: document.getElementById('cad-enunciado').value.trim(),
    alternativa_a: document.getElementById('cad-a').value.trim(),
    alternativa_b: document.getElementById('cad-b').value.trim(),
    alternativa_c: document.getElementById('cad-c').value.trim(),
    alternativa_d: document.getElementById('cad-d').value.trim(),
    alternativa_e: document.getElementById('cad-e').value.trim(),
    resposta_correta: parseInt(document.getElementById('cad-resposta').value, 10),
    explicacao: document.getElementById('cad-explicacao').value.trim() || null
  };

  try {
    await supabase.inserirQuestao(questao);
    mensagemCadastroEl.textContent = '✅ Questão cadastrada com sucesso!';
    mensagemCadastroEl.className = 'mensagem sucesso';
    mensagemCadastroEl.classList.remove('hidden');
    document.getElementById('form-cadastro').reset();
    await iniciar();
    setTimeout(() => mostrarTela('menu'), 1500);
  } catch (err) {
    console.error(err);
    mensagemCadastroEl.textContent = '❌ Erro ao salvar: ' + err.message;
    mensagemCadastroEl.className = 'mensagem erro';
    mensagemCadastroEl.classList.remove('hidden');
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.textContent = 'Salvar Questão';
  }
});

document.getElementById('btn-cancelar').addEventListener('click', () => mostrarTela('menu'));

// ===== START =====
iniciar();