function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== Đánh dấu thanh điệu (dùng để dựng 4 biến thể dấu thanh của 1 âm tiết) =====
const TONE_MARKS = {
  'a': ['a', 'ā', 'á', 'ǎ', 'à'],
  'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
  'e': ['e', 'ē', 'é', 'ě', 'è'],
  'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
  'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

// Bộ exam-2 chỉ dùng vận mẫu bắt đầu bằng i (ia, ie, iao, iou, ian, in, iang,
// ing, iong) nên dấu thanh không nhất quán nằm ở ký tự đầu của vận mẫu như bộ
// gốc (vd "jié" dấu ở chữ e, "jiǔ" dấu ở chữ u). Thay vì tách initial/final,
// tìm thẳng vị trí nguyên âm đang mang dấu trong chuỗi pinyin rồi đổi dấu tại
// đúng vị trí đó để dựng 4 biến thể — cách này đúng với mọi vị trí dấu.
function findAccentedVowel(pinyin) {
  for (let i = 0; i < pinyin.length; i++) {
    const ch = pinyin[i];
    for (const base of Object.keys(TONE_MARKS)) {
      const tone = TONE_MARKS[base].indexOf(ch);
      if (tone > 0) return { index: i, base, tone };
    }
  }
  return null;
}

function buildToneVariant(pinyin, index, base, tone) {
  return pinyin.slice(0, index) + TONE_MARKS[base][tone] + pinyin.slice(index + 1);
}

// Câu hỏi cho 1 từ đơn âm tiết (SINGLES): nghe rồi chọn đúng dấu thanh điệu
// trong 4 lựa chọn — cả 4 đáp án chỉ khác nhau ở dấu thanh (tone 1/2/3/4),
// giữ nguyên toàn bộ phần còn lại của pinyin. Không hiện gợi ý phần đã biết.
function buildSingleQuestion(item) {
  const accent = findAccentedVowel(item.pinyin);
  const options = accent
    ? shuffle([1, 2, 3, 4].map(tone => buildToneVariant(item.pinyin, accent.index, accent.base, tone)))
    : [item.pinyin];
  return {
    id: item.id,
    type: 'single',
    hanzi: item.hanzi,
    group: item.group,
    hintType: null,
    hintKnown: null,
    correct: item.pinyin,
    options,
  };
}

// Câu hỏi cho 1 từ 2 âm tiết (DOUBLES): nghe rồi chọn đúng pinyin đầy đủ
// trong 4 lựa chọn, đáp án nhiễu lấy từ các từ 2 âm tiết khác (khác pinyin
// với từ đang hỏi). pool dùng danh sách gốc (không giới hạn từ đã có audio)
// để luôn đủ nhiễu.
function buildDoubleQuestion(item, pool) {
  const others = pool.filter(d => d !== item && d.pinyin !== item.pinyin);
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

const QUESTIONS_PER_SESSION = 20;

// Kho câu hỏi: mỗi từ đã có audio (availableSingles/availableDoubles) sinh
// đúng 1 câu hỏi. Mỗi lần bắt đầu làm bài chỉ lấy ngẫu nhiên
// QUESTIONS_PER_SESSION câu trong kho đó.
function buildAllQuestions() {
  const singleQs = availableSingles.map(buildSingleQuestion);
  const doubleQs = availableDoubles.map(item => buildDoubleQuestion(item, DOUBLES));
  const pool = shuffle([...singleQs, ...doubleQs]);
  return pool.slice(0, QUESTIONS_PER_SESSION);
}

// ===== Trạng thái =====
let questions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let groupStats = { jqx: { correct: 0, total: 0 } };
let availableSingles = [];
let availableDoubles = [];
let currentStudentName = '';
let currentStudentClass = '';
let answerLog = [];

// ===== DOM =====
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const studentNameInput = document.getElementById('studentName');
const studentClassSelect = document.getElementById('studentClass');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const speedButtons = document.querySelectorAll('.speed-btn');
let currentSpeed = 1;
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
  audioEl.playbackRate = currentSpeed;
  currentAudioEl = audioEl;
  audioEl.play().catch((err) => console.error('Không phát được audio:', err));
}

// Kiểm tra file audio/<id>.mp3 có tồn tại không (đã tải sẵn từ trước).
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

  const total = availableSingles.length + availableDoubles.length;
  if (total === 0) {
    startBtn.textContent = 'Chưa có file audio nào';
  } else {
    const sessionSize = Math.min(total, QUESTIONS_PER_SESSION);
    startBtn.textContent = `Bắt đầu làm bài (${sessionSize} câu)`;
    startBtn.disabled = false;
  }
}
loadAvailableItems();

// ===== Tên học sinh =====
function initStudentName() {
  const savedName = localStorage.getItem('pinyinquiz_name');
  if (savedName) studentNameInput.value = savedName;
  const savedClass = localStorage.getItem('pinyinquiz_class');
  if (savedClass) studentClassSelect.value = savedClass;
}
initStudentName();

studentNameInput.addEventListener('input', () => {
  studentNameInput.classList.remove('input-error');
});

studentClassSelect.addEventListener('change', () => {
  studentClassSelect.classList.remove('input-error');
});

// ===== Nơi lưu kết quả =====
// Trang này không có bước build nên không đọc được file .env thật — dùng hằng
// số này làm "biến môi trường", đổi giá trị rồi deploy lại khi cần chuyển luồng.
//   'off'   = tắt hẳn việc lưu kết quả (không tải file, không gửi đi đâu cả) —
//             dùng khi đang test phần làm bài, chưa muốn đụng tới lưu trữ.
//   'excel' = tải file Excel (.xlsx) về máy ngay khi làm xong bài, không cần
//             cấu hình gì thêm, dùng được ngay.
//   'sheet' = gửi lên Google Sheet qua Apps Script Web App (cần điền
//             SCORE_WEBHOOK_URL bên dưới sau khi deploy Apps Script).
const SAVE_MODE = 'off'; // 'off' | 'excel' | 'sheet'

// Dán URL sau khi deploy Apps Script (chỉ cần khi SAVE_MODE = 'sheet').
const SCORE_WEBHOOK_URL = null; // vd: 'https://script.google.com/macros/s/AKfycb.../exec'

const XLSX_HEADERS = [
  'Thời gian', 'Tên học sinh', 'Điểm', 'Tổng số câu', 'Phần trăm',
  'Chi tiết theo nhóm (JSON)', 'Chi tiết bài làm (JSON)',
];

function payloadToRow(payload) {
  return [
    payload.timestamp,
    payload.studentName,
    payload.score,
    payload.total,
    payload.percent,
    JSON.stringify(payload.groupStats),
    JSON.stringify(payload.answers),
  ];
}

// Tải kết quả 1 lượt làm bài về máy dưới dạng file Excel thật (.xlsx, dùng
// thư viện SheetJS) — tránh lỗi font/encoding tiếng Việt hay gặp với file CSV.
// Dùng làm phương án dự phòng khi không ghi trực tiếp được vào file có sẵn
// (xem saveResultToExcel bên dưới).
function downloadResultAsXlsx(payload) {
  const ws = XLSX.utils.aoa_to_sheet([XLSX_HEADERS, payloadToRow(payload)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ket qua');

  const safeName = (payload.studentName || 'hoc-sinh').normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, '-');
  const safeTime = payload.timestamp.slice(0, 19).replace(/[:T]/g, '-');
  XLSX.writeFile(wb, `ket-qua-${safeName}-${safeTime}.xlsx`);
}

// ===== Ghi trực tiếp vào 1 file .xlsx có sẵn (File System Access API) =====
// Chỉ Chrome/Edge hỗ trợ. Phù hợp khi nhiều học sinh dùng CHUNG 1 máy/trình
// duyệt (vd máy tính lớp học) — chọn file 1 lần, các lần nộp bài sau tự động
// ghi nối thêm dòng vào đúng file đó. Nếu mỗi học sinh dùng thiết bị riêng,
// cách này KHÔNG gộp được dữ liệu giữa các máy — cần chuyển sang SAVE_MODE =
// 'sheet' (Google Sheet) để có 1 nơi lưu tập trung thật sự.
const IDB_NAME = 'pinyinquiz-fs';
const IDB_STORE = 'handles';
const RESULTS_FILE_HANDLE_KEY = 'resultsFileHandle';
let resultsFileHandleCache = null;

function supportsFileSystemAccess() {
  return typeof window.showOpenFilePicker === 'function';
}

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Lấy handle của file kết quả: dùng lại handle đã chọn từ lần trước (lưu
// trong IndexedDB) nếu còn quyền ghi; nếu chưa có, yêu cầu người dùng chọn
// file ket-qua-hoc-sinh.xlsx (chỉ hỏi 1 lần cho mỗi trình duyệt/máy).
async function getResultsFileHandle() {
  if (resultsFileHandleCache) return resultsFileHandleCache;

  const saved = await idbGet(RESULTS_FILE_HANDLE_KEY);
  if (saved) {
    let perm = await saved.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') perm = await saved.requestPermission({ mode: 'readwrite' });
    if (perm === 'granted') {
      resultsFileHandleCache = saved;
      return saved;
    }
  }

  const [handle] = await window.showOpenFilePicker({
    types: [{
      description: 'Excel',
      accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    }],
  });
  const perm = await handle.requestPermission({ mode: 'readwrite' });
  if (perm !== 'granted') throw new Error('Không được cấp quyền ghi file.');

  await idbSet(RESULTS_FILE_HANDLE_KEY, handle);
  resultsFileHandleCache = handle;
  return handle;
}

async function appendResultToXlsxFile(handle, payload) {
  const file = await handle.getFile();
  const buffer = await file.arrayBuffer();

  let rows;
  if (buffer.byteLength > 0) {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' });
    if (rows.length === 0) rows = [XLSX_HEADERS];
  } else {
    rows = [XLSX_HEADERS];
  }
  rows.push(payloadToRow(payload));

  const newSheet = XLSX.utils.aoa_to_sheet(rows);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Ket qua');
  const outBuffer = XLSX.write(newWorkbook, { type: 'array', bookType: 'xlsx' });

  const writable = await handle.createWritable();
  await writable.write(outBuffer);
  await writable.close();
}

async function saveResultToExcel(payload) {
  if (supportsFileSystemAccess()) {
    try {
      const handle = await getResultsFileHandle();
      await appendResultToXlsxFile(handle, payload);
      console.log('Đã ghi kết quả vào file Excel đã chọn.');
      return;
    } catch (err) {
      console.error('Không ghi được vào file Excel có sẵn, tải file mới thay thế:', err);
    }
  }
  downloadResultAsXlsx(payload);
}

function sendScoreToSheet(payload) {
  if (!SCORE_WEBHOOK_URL) return;
  fetch(SCORE_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }).catch((err) => console.error('Không gửi được điểm lên Google Sheet:', err));
}

// ===== Tốc độ =====
function setSpeed(val, save) {
  currentSpeed = val;
  speedButtons.forEach((btn) => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === val);
  });
  if (save) localStorage.setItem('pinyinquiz_speed', val);
}

function initSpeed() {
  const saved = parseFloat(localStorage.getItem('pinyinquiz_speed'));
  const val = (saved === 0.8 || saved === 1) ? saved : 1;
  setSpeed(val, false);
}
initSpeed();

speedButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setSpeed(parseFloat(btn.dataset.speed), true);
  });
});

// ===== Quiz flow =====
startBtn.addEventListener('click', () => {
  const name = studentNameInput.value.trim();
  const studentClass = studentClassSelect.value;

  if (!name) studentNameInput.classList.add('input-error');
  if (!studentClass) studentClassSelect.classList.add('input-error');
  if (!name || !studentClass) {
    (!name ? studentNameInput : studentClassSelect).focus();
    return;
  }

  studentNameInput.classList.remove('input-error');
  studentClassSelect.classList.remove('input-error');
  currentStudentName = name;
  currentStudentClass = studentClass;
  localStorage.setItem('pinyinquiz_name', name);
  localStorage.setItem('pinyinquiz_class', studentClass);

  questions = buildAllQuestions();
  currentIndex = 0;
  score = 0;
  answerLog = [];
  groupStats = { jqx: { correct: 0, total: 0 } };
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

  answerLog.push({
    id: q.id,
    hanzi: q.hanzi,
    type: q.type,
    hint: q.hintKnown || '',
    correct: q.correct,
    selected: opt,
    isCorrect,
  });

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

  const label = { jqx: 'j q x' };
  resultBreakdown.innerHTML = '';
  ['jqx'].forEach(g => {
    const s = groupStats[g];
    const p = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    row.textContent = `Nhóm ${label[g]}: ${s.correct}/${s.total} (${p}%)`;
    resultBreakdown.appendChild(row);
  });

  const payload = {
    studentName: currentStudentName,
    score,
    total: questions.length,
    percent: pct,
    groupStats,
    answers: answerLog,
    timestamp: new Date().toISOString(),
  };

  if (SAVE_MODE === 'sheet') {
    sendScoreToSheet(payload);
  } else if (SAVE_MODE === 'excel') {
    saveResultToExcel(payload);
  }
}
