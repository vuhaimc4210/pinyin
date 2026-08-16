// ===== Đánh dấu thanh điệu =====
const TONE_MARKS = {
  'a': ['a', 'ā', 'á', 'ǎ', 'à'],
  'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
  'e': ['e', 'ē', 'é', 'ě', 'è'],
  'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
  'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

function toneFinal(final, tone) {
  const first = final[0];
  const marked = TONE_MARKS[first][tone];
  return marked + final.slice(1);
}

function buildPinyin(initial, final, tone) {
  return initial + toneFinal(final, tone);
}

const GROUP_INITIALS = {
  bpmf: ['b', 'p', 'm', 'f'],
  dtnl: ['d', 't', 'n', 'l'],
  gkh: ['g', 'k', 'h'],
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Câu hỏi nhận diện PHỤ ÂM ĐẦU: vận mẫu + thanh điệu đã biết (hiện làm gợi ý),
// 4 đáp án chỉ khác nhau ở phụ âm đầu.
function buildSingleQuestion(item) {
  const initials = GROUP_INITIALS[item.group];
  const correct = buildPinyin(item.initial, item.final, item.tone);
  let options = initials.map(i => buildPinyin(i, item.final, item.tone));
  if (initials.length < 4) {
    let otherTone;
    do { otherTone = 1 + Math.floor(Math.random() * 4); } while (otherTone === item.tone);
    let extra = buildPinyin(item.initial, item.final, otherTone);
    if (!options.includes(extra)) options.push(extra);
  }
  return {
    id: item.id,
    type: 'initial',
    hanzi: item.hanzi,
    group: item.group,
    hintType: 'initial',
    hintKnown: toneFinal(item.final, item.tone), // vd: "āo" — phần đã biết, phụ âm đầu bị ẩn
    correct,
    options: shuffle(options),
  };
}

// Câu hỏi nhận diện THANH ĐIỆU: phụ âm đầu + vận mẫu đã biết (hiện làm gợi ý),
// 4 đáp án cùng phụ âm đầu + vận mẫu, chỉ khác dấu thanh (1/2/3/4).
function buildToneQuestion(item) {
  const correct = buildPinyin(item.initial, item.final, item.tone);
  const options = [1, 2, 3, 4].map(tone => buildPinyin(item.initial, item.final, tone));
  return {
    id: item.id,
    type: 'tone',
    hanzi: item.hanzi,
    group: item.group,
    hintType: 'tone',
    hintKnown: item.initial + item.final, // vd: "li" — phần đã biết, dấu thanh bị ẩn
    correct,
    options: shuffle(options),
  };
}

function buildDoubleQuestion(item, allDoubles) {
  const others = allDoubles.filter(d => d !== item && d.pinyin !== item.pinyin);
  const distractors = shuffle(others).slice(0, 3).map(d => d.pinyin);
  const options = shuffle([item.pinyin, ...distractors]);
  return {
    id: item.id,
    type: 'double',
    hanzi: item.hanzi,
    group: item.group,
    hintType: null,
    hintKnown: null,
    correct: item.pinyin,
    options,
  };
}

function buildAllQuestions() {
  const initialQs = availableSingles.map(buildSingleQuestion);
  const toneQs = availableSingles.map(buildToneQuestion);
  const doubleQs = availableDoubles.map(item => buildDoubleQuestion(item, DOUBLES));
  return shuffle([...initialQs, ...toneQs, ...doubleQs]);
}

// ===== Trạng thái =====
let questions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let groupStats = { bpmf: { correct: 0, total: 0 }, dtnl: { correct: 0, total: 0 }, gkh: { correct: 0, total: 0 } };
let availableSingles = [];
let availableDoubles = [];

// ===== DOM =====
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const speedRange = document.getElementById('speedRange');
const speedLabel = document.getElementById('speedLabel');
const hanziChar = document.getElementById('hanziChar');
const pinyinHint = document.getElementById('pinyinHint');
const playBtn = document.getElementById('playBtn');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const optionsContainer = document.getElementById('optionsContainer');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const scoreLive = document.getElementById('scoreLive');
const resultScore = document.getElementById('resultScore');
const resultBreakdown = document.getElementById('resultBreakdown');

// ===== Phát audio chuẩn =====
const AUDIO_DIR = 'audio/';
let currentAudioEl = null;

function stopAllAudio() {
  if (currentAudioEl) {
    currentAudioEl.pause();
    currentAudioEl = null;
  }
}

function playQuestionAudio(q) {
  stopAllAudio();
  const audioEl = new Audio(`${AUDIO_DIR}${q.id}.mp3`);
  audioEl.playbackRate = parseFloat(speedRange.value);
  currentAudioEl = audioEl;
  audioEl.play().catch((err) => console.error('Không phát được audio:', err));
}

// Kiểm tra file audio/<id>.mp3 có tồn tại không (đã tải sẵn bằng tools/test-internal-web.js).
// Bài học chỉ dùng những từ đã có file, nên phải kiểm tra xong mới cho bắt đầu làm bài.
function checkAudioAvailable(id) {
  return new Promise((resolve) => {
    const audioEl = new Audio(`${AUDIO_DIR}${id}.mp3`);
    audioEl.preload = 'metadata';
    audioEl.addEventListener('loadedmetadata', () => resolve(true), { once: true });
    audioEl.addEventListener('error', () => resolve(false), { once: true });
  });
}

async function loadAvailableItems() {
  const singleChecks = await Promise.all(SINGLES.map(item => checkAudioAvailable(item.id)));
  availableSingles = SINGLES.filter((_, idx) => singleChecks[idx]);

  const doubleChecks = await Promise.all(DOUBLES.map(item => checkAudioAvailable(item.id)));
  availableDoubles = DOUBLES.filter((_, idx) => doubleChecks[idx]);

  const total = availableSingles.length * 2 + availableDoubles.length;
  if (total === 0) {
    startBtn.textContent = 'Chưa có file audio nào';
  } else {
    startBtn.textContent = `Bắt đầu làm bài (${total} câu)`;
    startBtn.disabled = false;
  }
}
loadAvailableItems();

// ===== Tốc độ =====
function initSpeed() {
  const saved = localStorage.getItem('pinyinquiz_speed');
  const val = saved ? parseFloat(saved) : 1.0;
  speedRange.value = val;
  speedLabel.textContent = val.toFixed(2) + 'x';
}
initSpeed();

speedRange.addEventListener('input', () => {
  const val = parseFloat(speedRange.value);
  speedLabel.textContent = val.toFixed(2) + 'x';
  localStorage.setItem('pinyinquiz_speed', val);
});

// ===== Quiz flow =====
startBtn.addEventListener('click', () => {
  questions = buildAllQuestions();
  currentIndex = 0;
  score = 0;
  groupStats = { bpmf: { correct: 0, total: 0 }, dtnl: { correct: 0, total: 0 }, gkh: { correct: 0, total: 0 } };
  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  renderQuestion();
});

restartBtn.addEventListener('click', () => {
  resultScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

playBtn.addEventListener('click', () => {
  const q = questions[currentIndex];
  playQuestionAudio(q);
});

nextBtn.addEventListener('click', () => {
  currentIndex++;
  if (currentIndex >= questions.length) {
    showResults();
  } else {
    renderQuestion();
  }
});

// Hiện gợi ý pinyin: phần đã biết + 1 chỗ trống ở vị trí đang hỏi (phụ âm đầu
// hoặc dấu thanh). Từ 2 âm tiết không có gợi ý vì cả cụm pinyin đang được hỏi.
function renderPinyinHint(q) {
  pinyinHint.innerHTML = '';
  if (!q.hintKnown) {
    pinyinHint.classList.add('hidden');
    return;
  }
  pinyinHint.classList.remove('hidden');

  if (q.hintType === 'tone') {
    pinyinHint.classList.add('hint-tone');
    const blank = document.createElement('div');
    blank.className = 'hint-blank-line';
    const known = document.createElement('div');
    known.className = 'hint-known';
    known.textContent = q.hintKnown;
    pinyinHint.append(blank, known);
  } else {
    pinyinHint.classList.remove('hint-tone');
    const blank = document.createElement('span');
    blank.className = 'hint-blank-inline';
    const known = document.createElement('span');
    known.className = 'hint-known';
    known.textContent = q.hintKnown;
    pinyinHint.append(blank, known);
  }
}

function renderQuestion() {
  answered = false;
  const q = questions[currentIndex];
  progressText.textContent = `Câu ${currentIndex + 1} / ${questions.length}`;
  progressBar.style.width = `${(currentIndex / questions.length) * 100}%`;
  scoreLive.textContent = `Điểm: ${score}`;
  feedback.textContent = '';
  feedback.className = 'feedback';
  nextBtn.classList.add('hidden');

  hanziChar.textContent = q.hanzi;
  renderPinyinHint(q);

  optionsContainer.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectOption(opt, btn));
    optionsContainer.appendChild(btn);
  });

  setTimeout(() => playQuestionAudio(q), 150);
}

function selectOption(opt, btnEl) {
  if (answered) return;
  answered = true;
  const q = questions[currentIndex];
  const isCorrect = opt === q.correct;

  groupStats[q.group].total++;
  if (isCorrect) {
    groupStats[q.group].correct++;
    score++;
  }

  Array.from(optionsContainer.children).forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.correct) btn.classList.add('correct');
    else if (btn === btnEl) btn.classList.add('incorrect');
  });

  feedback.textContent = isCorrect
    ? '✅ Chính xác!'
    : `❌ Sai rồi. Đáp án đúng: ${q.correct}`;
  feedback.className = 'feedback ' + (isCorrect ? 'ok' : 'bad');
  scoreLive.textContent = `Điểm: ${score}`;
  nextBtn.classList.remove('hidden');
  nextBtn.textContent = currentIndex + 1 >= questions.length ? 'Xem kết quả →' : 'Câu tiếp theo →';
}

function showResults() {
  quizScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  const pct = Math.round((score / questions.length) * 100);
  resultScore.textContent = `${score} / ${questions.length} (${pct}%)`;

  const label = { bpmf: 'b p m f', dtnl: 'd t n l', gkh: 'g k h' };
  resultBreakdown.innerHTML = '';
  ['bpmf', 'dtnl', 'gkh'].forEach(g => {
    const s = groupStats[g];
    const p = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    row.textContent = `Nhóm ${label[g]}: ${s.correct}/${s.total} (${p}%)`;
    resultBreakdown.appendChild(row);
  });
}
