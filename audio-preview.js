// Tính pinyin có dấu thanh cho các từ 1 âm tiết (copy tối giản từ app.js,
// không dùng chung app.js vì file đó gắn sự kiện cho các phần tử của trang quiz).
const TONE_MARKS = {
  'a': ['a', 'ā', 'á', 'ǎ', 'à'],
  'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
  'e': ['e', 'ē', 'é', 'ě', 'è'],
  'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
  'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

function toneFinal(final, tone) {
  const marked = TONE_MARKS[final[0]][tone];
  return marked + final.slice(1);
}

function buildPinyin(initial, final, tone) {
  return initial + toneFinal(final, tone);
}

const AUDIO_DIR = 'audio/';
const totalCount = SINGLES.length + DOUBLES.length;
let availableCount = 0;
let checkedCount = 0;
const audioEls = [];

const summaryEl = document.getElementById('summary');
const speedRange = document.getElementById('speedRange');
const speedLabel = document.getElementById('speedLabel');

function getSpeed() {
  return parseFloat(speedRange.value);
}

speedRange.addEventListener('input', () => {
  const speed = getSpeed();
  speedLabel.textContent = speed.toFixed(2) + 'x';
  audioEls.forEach((audioEl) => { audioEl.playbackRate = speed; });
});

function updateSummary() {
  summaryEl.textContent = `Đã có ${availableCount} / ${totalCount} từ (đã kiểm tra ${checkedCount}/${totalCount})`;
}

function renderWordRow(container, id, hanzi, pinyin) {
  const row = document.createElement('div');
  row.className = 'word-row';

  const hanziEl = document.createElement('span');
  hanziEl.className = 'word-hanzi';
  hanziEl.textContent = hanzi;

  const pinyinEl = document.createElement('span');
  pinyinEl.className = 'word-pinyin';
  pinyinEl.textContent = pinyin;

  const idEl = document.createElement('span');
  idEl.className = 'word-id';
  idEl.textContent = id;

  const audioWrap = document.createElement('div');
  audioWrap.className = 'word-audio';

  const audioEl = document.createElement('audio');
  audioEl.controls = true;
  audioEl.preload = 'metadata';
  audioEl.playbackRate = getSpeed();
  audioEl.src = `${AUDIO_DIR}${id}.mp3`;
  audioWrap.appendChild(audioEl);
  audioEls.push(audioEl);

  row.append(hanziEl, pinyinEl, idEl, audioWrap);
  container.appendChild(row);

  audioEl.addEventListener('loadedmetadata', () => {
    audioEl.playbackRate = getSpeed();
    availableCount++;
    checkedCount++;
    updateSummary();
  }, { once: true });

  audioEl.addEventListener('error', () => {
    checkedCount++;
    audioWrap.innerHTML = '';
    const badge = document.createElement('span');
    badge.className = 'badge badge-missing';
    badge.textContent = 'Chưa có';
    audioWrap.appendChild(badge);
    updateSummary();
  }, { once: true });
}

const singlesListEl = document.getElementById('singlesList');
SINGLES.forEach((item) => {
  renderWordRow(singlesListEl, item.id, item.hanzi, buildPinyin(item.initial, item.final, item.tone));
});

const doublesListEl = document.getElementById('doublesList');
DOUBLES.forEach((item) => {
  renderWordRow(doublesListEl, item.id, item.hanzi, item.pinyin);
});

updateSummary();
