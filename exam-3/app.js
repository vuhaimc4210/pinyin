/* ===== 1. Tách pinyin có dấu của exam-2 (SINGLES) thành initial/final/tone =====
   Dùng 1 lần khi nạp trang để chuyển dữ liệu gốc (id/hanzi/pinyin) sang dạng
   {h,i,f,t,id} — giống cấu trúc DATA của web-sample — mà không phải chép tay
   lại 20 từ (giữ đúng 1 nguồn dữ liệu duy nhất: exam-2/data.js). */
const VOWEL_MARKS = {
  'a': ['a', 'ā', 'á', 'ǎ', 'à'],
  'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
  'e': ['e', 'ē', 'é', 'ě', 'è'],
  'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
  'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
};
const INITIALS = ['j', 'q', 'x'];

function findAccentedVowel(pinyin) {
  for (let idx = 0; idx < pinyin.length; idx++) {
    const ch = pinyin[idx];
    for (const base of Object.keys(VOWEL_MARKS)) {
      const tone = VOWEL_MARKS[base].indexOf(ch);
      if (tone > 0) return { index: idx, base, tone };
    }
  }
  return null;
}

// "jiǎo" -> { h:'脚', i:'j', f:'iao', t:3, id:'2.脚' }. Quy ước "iou" là tên
// chuẩn của vận mẫu viết tắt "iu" sau j/q/x (khớp với FINAL_TONES bên dưới).
function toDataItem(item) {
  const initial = INITIALS.find(x => item.pinyin.startsWith(x));
  const accent = findAccentedVowel(item.pinyin);
  const restAfterInitial = item.pinyin.slice(initial.length);
  const offset = accent.index - initial.length;
  const spelledFinal = restAfterInitial.slice(0, offset) + accent.base + restAfterInitial.slice(offset + 1);
  const canonicalFinal = spelledFinal === 'iu' ? 'iou' : spelledFinal;
  return { h: item.hanzi, i: initial, f: canonicalFinal, t: accent.tone, id: item.id };
}

const DATA = SINGLES.map(toDataItem);

/* ===== 2. Bảng dấu thanh điệu theo vận mẫu (copy từ web-sample) ===== */
const FINAL_TONES = {
  ia:   ['iā','iá','iǎ','ià'],
  ie:   ['iē','ié','iě','iè'],
  iao:  ['iāo','iáo','iǎo','iào'],
  iou:  ['iū','iú','iǔ','iù'],      // viết chuẩn là "iu"
  ian:  ['iān','ián','iǎn','iàn'],
  in:   ['īn','ín','ǐn','ìn'],
  iang: ['iāng','iáng','iǎng','iàng'],
  ing:  ['īng','íng','ǐng','ìng'],
  iong: ['iōng','ióng','iǒng','iòng'],
};
const FINAL_LIST = ['ia','ie','iao','iou','ian','in','iang','ing','iong'];
const FINAL_LABEL = {ia:'ia',ie:'ie',iao:'iao',iou:'iu',ian:'ian',in:'in',iang:'iang',ing:'ing',iong:'iong'};
const INITIAL_CONFUSE_POOL = ['j','q','x','g','k','h','z','c','s'];
const TONE_MARKS = ['ˉ','ˊ','ˇ','ˋ'];

function pinyin(initial, final, tone) {
  return initial + FINAL_TONES[final][tone - 1];
}

/* ===== 3. Sinh đáp án nhiễu theo từng dạng bài (copy nguyên logic từ web-sample) ===== */
function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

function buildOptionsPinyin(item) {
  const correct = pinyin(item.i, item.f, item.t);
  const pool = new Set();
  INITIALS.filter(x => x !== item.i).forEach(ci => pool.add(pinyin(ci, item.f, item.t)));
  [1, 2, 3, 4].filter(t => t !== item.t).forEach(t => pool.add(pinyin(item.i, item.f, t)));
  shuffle(FINAL_LIST.filter(f => f !== item.f)).slice(0, 3).forEach(f => pool.add(pinyin(item.i, f, item.t)));
  pool.delete(correct);
  const wrong = shuffle(Array.from(pool)).slice(0, 3);
  return { correct, options: shuffle([...wrong, correct]) };
}

function buildOptionsInitial(item) {
  const correct = item.i;
  const others = INITIALS.filter(x => x !== item.i);
  const extraPool = shuffle(INITIAL_CONFUSE_POOL.filter(x => x !== item.i && !others.includes(x)));
  const wrong = shuffle([...others, extraPool[0], extraPool[1]]).slice(0, 3);
  return { correct, options: shuffle([...wrong, correct]) };
}

function buildOptionsFinal(item) {
  const correct = FINAL_LABEL[item.f];
  const wrong = shuffle(FINAL_LIST.filter(f => f !== item.f)).slice(0, 3).map(f => FINAL_LABEL[f]);
  return { correct, options: shuffle([...wrong, correct]) };
}

function buildOptionsTone(item) {
  const correct = String(item.t);
  const options = ['1', '2', '3', '4'];
  return { correct, options }; // luôn đủ 4 thanh điệu, không xáo để dễ đối chiếu ˉˊˇˋ
}

const MODE_CONFIG = {
  pinyin:  { label: '拼音', vn: 'Phiên âm đầy đủ', prompt: 'Nghe và chọn phiên âm đúng',           build: buildOptionsPinyin,  optFmt: o => o },
  initial: { label: '声母', vn: 'Ghép thanh mẫu',   prompt: 'Nghe và chọn thanh mẫu (âm đầu) đúng',  build: buildOptionsInitial, optFmt: o => o },
  final:   { label: '韵母', vn: 'Ghép vận mẫu',     prompt: 'Nghe và chọn vận mẫu (âm cuối) đúng',   build: buildOptionsFinal,   optFmt: o => o },
  tone:    { label: '声调', vn: 'Ghép thanh điệu',  prompt: 'Nghe và chọn thanh điệu đúng',          build: buildOptionsTone,    optFmt: o => o + ' ' + TONE_MARKS[parseInt(o) - 1] },
};

/* ===== 4. Trạng thái luyện tập ===== */
let mode = 'pinyin';
let order = [];
let idx = 0;
let score = 0;
let answered = false;
let currentAnswer = null;
let quizStarted = false;
let availableData = [];
let currentStudentName = '';
let currentStudentClass = '';
let answerLog = [];
let groupStats = { jqx: { correct: 0, total: 0 } };

function shuffleDeck() {
  order = availableData.map((_, i) => i).sort(() => Math.random() - 0.5);
  idx = 0; score = 0; answered = false; answerLog = [];
  groupStats = { jqx: { correct: 0, total: 0 } };
}

const els = {
  startScreen: document.getElementById('startScreen'),
  studentNameInput: document.getElementById('studentName'),
  studentClassSelect: document.getElementById('studentClass'),
  startBtn: document.getElementById('startBtn'),
  qnum: document.getElementById('qnum'),
  qtypeBadge: document.getElementById('qtypeBadge'),
  hanzi: document.getElementById('hanzi'),
  qprompt: document.getElementById('qprompt'),
  options: document.getElementById('options'),
  feedback: document.getElementById('feedback'),
  nextBtn: document.getElementById('nextBtn'),
  playBtn: document.getElementById('playBtn'),
  progressText: document.getElementById('progressText'),
  scoreText: document.getElementById('scoreText'),
  barFill: document.getElementById('barFill'),
  app: document.getElementById('app'),
  endScreen: document.getElementById('endScreen'),
  finalScore: document.getElementById('finalScore'),
  endLabel: document.getElementById('endLabel'),
  restartBtn: document.getElementById('restartBtn'),
};

function renderQuestion(autoplay = true) {
  answered = false;
  const item = availableData[order[idx]];
  const cfg = MODE_CONFIG[mode];
  const { correct, options } = cfg.build(item);
  currentAnswer = { item, correct, cfg };

  els.qnum.textContent = String(idx + 1).padStart(2, '0');
  els.qtypeBadge.textContent = cfg.label;
  els.hanzi.textContent = item.h;
  els.qprompt.textContent = cfg.prompt;
  els.feedback.textContent = '';
  els.feedback.className = 'feedback';
  els.nextBtn.classList.remove('show');
  els.progressText.textContent = `Câu ${idx + 1} / ${availableData.length}`;
  els.scoreText.textContent = `Đúng: ${score}`;
  els.barFill.style.width = `${(idx / availableData.length) * 100 + 1}%`;

  els.options.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'opt';
    btn.textContent = cfg.optFmt(opt);
    btn.onclick = () => selectAnswer(btn, opt);
    els.options.appendChild(btn);
  });

  if (autoplay) playCurrentAudio();
}

function selectAnswer(btn, opt) {
  if (answered) return;
  answered = true;
  const isCorrect = opt === currentAnswer.correct;
  if (isCorrect) score++;

  groupStats.jqx.total++;
  if (isCorrect) groupStats.jqx.correct++;

  document.querySelectorAll('.opt').forEach(b => { b.disabled = true; });
  const cfg = currentAnswer.cfg;
  document.querySelectorAll('.opt').forEach(b => {
    if (b.textContent === cfg.optFmt(currentAnswer.correct)) b.classList.add('correct');
    else if (b === btn) b.classList.add('wrong');
  });

  const item = currentAnswer.item;
  const fullPinyin = pinyin(item.i, item.f, item.t);
  els.feedback.textContent = isCorrect
    ? `✓ Chính xác — ${item.h} (${fullPinyin})`
    : `✗ Chưa đúng — đáp án đúng: ${cfg.optFmt(currentAnswer.correct)} — ${item.h} (${fullPinyin})`;
  els.feedback.className = 'feedback ' + (isCorrect ? 'ok' : 'no');
  els.scoreText.textContent = `Đúng: ${score}`;
  els.nextBtn.classList.add('show');

  answerLog.push({
    id: item.id, hanzi: item.h, mode, correct: cfg.optFmt(currentAnswer.correct),
    selected: cfg.optFmt(opt), isCorrect,
  });
}

els.nextBtn.onclick = () => {
  idx++;
  if (idx >= availableData.length) showEnd(); else renderQuestion();
};

function showEnd() {
  els.app.style.display = 'none';
  els.endScreen.style.display = 'block';
  els.finalScore.textContent = `${score} / ${availableData.length}`;
  els.endLabel.textContent = `Số câu trả lời đúng trong lượt luyện "${MODE_CONFIG[mode].vn}" này`;
  saveResult();
}

els.restartBtn.onclick = () => {
  els.endScreen.style.display = 'none';
  els.app.style.display = 'none';
  quizStarted = false;
  els.startScreen.style.display = 'block';
};

/* ===== 5. Chuyển dạng bài (tabs) =====
   Nếu đang làm bài thì đổi dạng sẽ xáo lại bộ câu hỏi theo dạng mới ngay
   (giống web-sample); nếu chưa bắt đầu thì chỉ ghi nhớ lựa chọn, chờ bấm "Bắt đầu làm bài". */
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    mode = tab.dataset.mode;
    if (quizStarted) {
      els.endScreen.style.display = 'none';
      els.app.style.display = 'block';
      shuffleDeck();
      renderQuestion(false);
    }
  };
});

/* ===== 6. Phát audio (dùng file ghi âm gốc của bài 2, không TTS) ===== */
const AUDIO_DIR = '../exam-2/audio/';
let currentSpeed = 1;
let currentAudioEl = null;

function stopAllAudio() {
  if (currentAudioEl) {
    currentAudioEl.pause();
    currentAudioEl = null;
  }
}

function playCurrentAudio() {
  const item = availableData[order[idx]];
  stopAllAudio();
  const audioEl = new Audio(`${AUDIO_DIR}${item.id}.mp3`);
  audioEl.playbackRate = currentSpeed;
  currentAudioEl = audioEl;
  els.playBtn.disabled = true;
  audioEl.addEventListener('ended', () => { els.playBtn.disabled = false; });
  audioEl.play().catch((err) => {
    els.playBtn.disabled = false;
    if (err.name === 'AbortError') return;
    console.error('Không phát được audio:', err);
  });
}
els.playBtn.onclick = playCurrentAudio;

// Dùng fetch (HEAD) thay vì tạo <audio> rồi chờ 'loadedmetadata': nhiều trình
// duyệt di động (đặc biệt Safari iOS) chặn không cho phần tử audio tải bất cứ
// gì (kể cả metadata) trước khi có cử chỉ chạm của người dùng trên trang —
// khiến sự kiện 'loadedmetadata' không bao giờ bắn, Promise treo vô hạn và
// nút "Bắt đầu" không bao giờ được bật. fetch không bị giới hạn này.
function checkAudioAvailable(id) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  return fetch(`${AUDIO_DIR}${id}.mp3`, { method: 'HEAD', signal: controller.signal })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => clearTimeout(timeout));
}

async function loadAvailableData() {
  const checks = await Promise.all(DATA.map(item => checkAudioAvailable(item.id)));
  availableData = DATA.filter((_, i) => checks[i]);

  if (availableData.length === 0) {
    els.startBtn.textContent = 'Chưa có file audio nào';
  } else {
    els.startBtn.textContent = `Bắt đầu làm bài (${availableData.length} câu)`;
    els.startBtn.disabled = false;
  }
}
loadAvailableData();

/* ===== 7. Tốc độ đọc (2 mức, thay cho thanh trượt + chọn giọng TTS của web-sample) ===== */
const speedButtons = document.querySelectorAll('.speed-btn');

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
  btn.addEventListener('click', () => setSpeed(parseFloat(btn.dataset.speed), true));
});

/* ===== 8. Tên học sinh + lớp (bắt buộc, đồng bộ với bài 1/2) ===== */
function initStudentName() {
  const savedName = localStorage.getItem('pinyinquiz_name');
  if (savedName) els.studentNameInput.value = savedName;
  const savedClass = localStorage.getItem('pinyinquiz_class');
  if (savedClass) els.studentClassSelect.value = savedClass;
}
initStudentName();

els.studentNameInput.addEventListener('input', () => els.studentNameInput.classList.remove('input-error'));
els.studentClassSelect.addEventListener('change', () => els.studentClassSelect.classList.remove('input-error'));

els.startBtn.addEventListener('click', () => {
  const name = els.studentNameInput.value.trim();
  const studentClass = els.studentClassSelect.value;

  if (!name) els.studentNameInput.classList.add('input-error');
  if (!studentClass) els.studentClassSelect.classList.add('input-error');
  if (!name || !studentClass) {
    (!name ? els.studentNameInput : els.studentClassSelect).focus();
    return;
  }

  els.studentNameInput.classList.remove('input-error');
  els.studentClassSelect.classList.remove('input-error');
  currentStudentName = name;
  currentStudentClass = studentClass;
  localStorage.setItem('pinyinquiz_name', name);
  localStorage.setItem('pinyinquiz_class', studentClass);

  quizStarted = true;
  els.startScreen.style.display = 'none';
  els.app.style.display = 'block';
  shuffleDeck();
  renderQuestion(true);
});

/* ===== 9. Lưu kết quả (giống bài 1/2/3 — đang tắt, đổi SAVE_MODE khi cần dùng) ===== */
const SAVE_MODE = 'off'; // 'off' | 'excel' | 'sheet'
const SCORE_WEBHOOK_URL = null;

const XLSX_HEADERS = [
  'Thời gian', 'Tên học sinh', 'Lớp', 'Dạng câu hỏi', 'Điểm', 'Tổng số câu', 'Phần trăm',
  'Chi tiết theo nhóm (JSON)', 'Chi tiết bài làm (JSON)',
];

function payloadToRow(payload) {
  return [
    payload.timestamp, payload.studentName, payload.studentClass, payload.modeLabel,
    payload.score, payload.total, payload.percent,
    JSON.stringify(payload.groupStats), JSON.stringify(payload.answers),
  ];
}

function downloadResultAsXlsx(payload) {
  const ws = XLSX.utils.aoa_to_sheet([XLSX_HEADERS, payloadToRow(payload)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ket qua');
  const safeName = (payload.studentName || 'hoc-sinh').normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, '-');
  const safeTime = payload.timestamp.slice(0, 19).replace(/[:T]/g, '-');
  XLSX.writeFile(wb, `ket-qua-${safeName}-${safeTime}.xlsx`);
}

function sendScoreToSheet(payload) {
  if (!SCORE_WEBHOOK_URL) return;
  fetch(SCORE_WEBHOOK_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }).catch((err) => console.error('Không gửi được điểm lên Google Sheet:', err));
}

function saveResult() {
  const payload = {
    studentName: currentStudentName,
    studentClass: currentStudentClass,
    modeLabel: MODE_CONFIG[mode].vn,
    score,
    total: availableData.length,
    percent: Math.round((score / availableData.length) * 100),
    groupStats,
    answers: answerLog,
    timestamp: new Date().toISOString(),
  };

  if (SAVE_MODE === 'sheet') sendScoreToSheet(payload);
  else if (SAVE_MODE === 'excel') downloadResultAsXlsx(payload);
}
