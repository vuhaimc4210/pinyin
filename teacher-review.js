// Trang này không có bước build nên không đọc được file .env thật — dùng hằng
// số này làm "biến môi trường", đổi giá trị rồi deploy lại khi cần chuyển
// nguồn dữ liệu. Đây là quyết định của người triển khai code, KHÔNG hiện ra
// cho giáo viên chọn trên giao diện.
//   'excel' = đọc file RESULTS_FILE_PATH (.xlsx) cố định nằm cùng thư mục web.
//   'sheet' = đọc từ Google Sheet qua Apps Script Web App (REVIEW_WEBHOOK_URL).
const REVIEW_MODE = 'excel'; // 'excel' | 'sheet'

// Mật khẩu giáo viên. Khi tích hợp Google Sheet, đặt ĐÚNG giá trị này vào
// hằng TEACHER_CODE trong Apps Script — không cần đổi gì ở đây. Việc kiểm
// tra ở file này chỉ chặn xem thoáng qua (ai đọc được mã nguồn trang này vẫn
// thấy được mật khẩu); phần kiểm tra thật sự (không thể qua mặt) nằm ở Apps
// Script khi dùng REVIEW_MODE = 'sheet'.
const TEACHER_CODE = 'FPbrDXtM';

// Dán URL Apps Script Web App vào đây khi REVIEW_MODE = 'sheet' (cùng URL với
// SCORE_WEBHOOK_URL trong app.js, vì cùng 1 script xử lý cả ghi điểm (doPost)
// và đọc lại kết quả (doGet)).
const REVIEW_WEBHOOK_URL = null; // vd: 'https://script.google.com/macros/s/AKfycb.../exec'

// File Excel cố định nằm cùng thư mục web — gộp các dòng kết quả học sinh tải
// về vào đây (giữ đúng 1 dòng tiêu đề ở trên cùng) rồi deploy lại.
const RESULTS_FILE_PATH = 'ket-qua-hoc-sinh.xlsx';

const teacherPasswordInput = document.getElementById('teacherPassword');
const loadBtn = document.getElementById('loadBtn');
const loadStatus = document.getElementById('loadStatus');
const submissionList = document.getElementById('submissionList');
const detailPanel = document.getElementById('detailPanel');
const detailTitle = document.getElementById('detailTitle');
const detailList = document.getElementById('detailList');
const closeDetailBtn = document.getElementById('closeDetailBtn');

const TYPE_LABEL = { initial: 'Phụ âm đầu', tone: 'Thanh điệu', double: 'Từ 2 âm tiết' };

let submissions = [];

closeDetailBtn.addEventListener('click', () => detailPanel.classList.add('hidden'));

function checkPassword() {
  const pass = teacherPasswordInput.value.trim();
  if (pass !== TEACHER_CODE) {
    loadStatus.textContent = 'Sai mật khẩu.';
    return false;
  }
  return true;
}

loadBtn.addEventListener('click', () => {
  if (!checkPassword()) return;
  if (REVIEW_MODE === 'sheet') {
    loadFromSheet();
  } else {
    loadFromExcel();
  }
});

// ===== Nguồn 'excel': đọc file .xlsx cố định có sẵn trong thư mục web =====
async function loadFromExcel() {
  loadStatus.textContent = 'Đang tải...';
  submissionList.innerHTML = '';
  detailPanel.classList.add('hidden');

  try {
    const res = await fetch(RESULTS_FILE_PATH, { cache: 'no-store' });
    if (res.status === 404) {
      submissions = [];
      loadStatus.textContent = `Chưa có file ${RESULTS_FILE_PATH} — tạo file này (dòng tiêu đề + các dòng kết quả) rồi thử lại.`;
      renderSubmissionList();
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });

    submissions = rowsToSubmissions(rows);
    submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    loadStatus.textContent = `Đã tải ${submissions.length} lượt làm bài từ ${RESULTS_FILE_PATH}.`;
    renderSubmissionList();
  } catch (err) {
    loadStatus.textContent = `Lỗi đọc ${RESULTS_FILE_PATH}: ${err.message}`;
  }
}

function safeParseJson(text) {
  try { return JSON.parse(text); } catch (err) { return null; }
}

// File có 1 dòng tiêu đề + nhiều dòng kết quả (mỗi dòng = 1 lượt làm bài, gộp
// từ các file .xlsx học sinh tải về).
function rowsToSubmissions(rows) {
  return rows.slice(1).filter((r) => r.length > 0 && r[0]).map((row) => {
    const [timestamp, studentName, score, total, percent, groupStatsJson, answersJson] = row;
    return {
      timestamp,
      studentName,
      score: Number(score),
      total: Number(total),
      percent: Number(percent),
      groupStats: safeParseJson(groupStatsJson) || {},
      answers: safeParseJson(answersJson) || [],
    };
  });
}

// ===== Nguồn 'sheet': đọc từ Google Sheet qua Apps Script =====
async function loadFromSheet() {
  if (!REVIEW_WEBHOOK_URL) {
    loadStatus.textContent = 'Chưa cấu hình REVIEW_WEBHOOK_URL trong teacher-review.js.';
    return;
  }

  loadStatus.textContent = 'Đang tải...';
  submissionList.innerHTML = '';
  detailPanel.classList.add('hidden');

  try {
    const url = `${REVIEW_WEBHOOK_URL}?code=${encodeURIComponent(TEACHER_CODE)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.error) throw new Error(data.error);

    submissions = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    loadStatus.textContent = `Đã tải ${submissions.length} lượt làm bài.`;
    renderSubmissionList();
  } catch (err) {
    loadStatus.textContent = `Lỗi: ${err.message}.`;
  }
}

// ===== Hiển thị (dùng chung cho cả 2 nguồn) =====
function formatTime(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('vi-VN');
}

function renderSubmissionList() {
  submissionList.innerHTML = '';
  submissions.forEach((sub, idx) => {
    const row = document.createElement('div');
    row.className = 'word-row';

    const info = document.createElement('span');
    info.textContent = `${sub.studentName} — ${sub.score}/${sub.total} (${sub.percent}%) — ${formatTime(sub.timestamp)}`;

    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = 'Xem chi tiết';
    btn.addEventListener('click', () => showDetail(idx));

    row.append(info, btn);
    submissionList.appendChild(row);
  });
}

function showDetail(idx) {
  const sub = submissions[idx];
  detailTitle.textContent = `${sub.studentName} — ${sub.score}/${sub.total} (${sub.percent}%) — ${formatTime(sub.timestamp)}`;
  detailList.innerHTML = '';

  (sub.answers || []).forEach((a, i) => {
    const row = document.createElement('div');
    row.className = 'word-row';

    const text = document.createElement('span');
    text.textContent = `Câu ${i + 1}: ${a.hanzi} [${TYPE_LABEL[a.type] || a.type}] — đúng: ${a.correct} — chọn: ${a.selected}`;

    const badge = document.createElement('span');
    badge.className = 'badge ' + (a.isCorrect ? 'badge-correct' : 'badge-missing');
    badge.textContent = a.isCorrect ? 'Đúng' : 'Sai';

    row.append(text, badge);
    detailList.appendChild(row);
  });

  detailPanel.classList.remove('hidden');
}
