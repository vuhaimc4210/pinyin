// Không phải file chạy trên web — đây là mã nguồn để DÁN vào Apps Script của
// Google Sheet (Tiện ích mở rộng > Apps Script), sau khi đã import file
// ket-qua-hoc-sinh.xlsx vào Sheet đó (giữ nguyên dòng tiêu đề: Thời gian bắt
// đầu, Tên, Lớp, Tên bài, Phần, Số điểm, Tổng số câu, Thời gian kết thúc,
// Tổng thời gian (phút)). Xem hướng dẫn triển khai đầy đủ trong config.js
// cùng thư mục.

// Phải khớp TEACHER_CODE trong teacher-review.js — chặn ai gọi doGet mà
// không có mật khẩu giáo viên.
const TEACHER_CODE = 'FPbrDXtM';

// Tên sheet (tab) chứa dữ liệu — đổi nếu bạn đặt tên khác khi import.
const SHEET_NAME = 'Ket qua';

// Ghi điểm: app.js (3 bài) POST payload JSON tới URL /exec khi học sinh nộp
// bài (SAVE_MODE = 'sheet').
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow([
    data.startTime,
    data.studentName,
    data.studentClass,
    data.examName,
    data.modeLabel,
    data.score,
    data.total,
    data.timestamp,
    data.durationMinutes,
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Sheet tự nhận diện chuỗi "YYYY-MM-DD HH:mm:ss" ghi vào là kiểu Ngày/giờ và
// lưu thành ô Date — lúc đó getValues() trả về đối tượng Date (theo giờ quy
// đổi nội bộ), nếu để JSON.stringify tự xử lý sẽ ra giờ UTC (hậu tố "Z"),
// sai lệch 7 tiếng. Ép format lại theo giờ Việt Nam trước khi trả JSON.
function formatCell(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
  }
  return value;
}

// Top 3 điểm cao nhất cho 1 cặp Bài + Phần cụ thể — gọi CÔNG KHAI, không cần
// mật khẩu, vì app.js gọi thẳng từ màn hình kết quả để mọi học sinh xem ngay
// sau khi nộp bài (?action=top&exam=...&part=...). Chỉ trả tên, lớp, điểm —
// không trả thời gian hay các dữ liệu khác trong Sheet.
function getTopScores(exam, part) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const body = rows.slice(1).filter((row) => row[0]);
  const top = body
    .filter((row) => row[3] === exam && row[4] === part)
    .map((row) => ({
      studentName: row[1],
      studentClass: row[2],
      score: Number(row[5]),
      total: Number(row[6]),
      durationMinutes: Number(row[8]),
    }))
    // Điểm cao hơn xếp trước; bằng điểm thì ai làm nhanh hơn xếp trước.
    .sort((a, b) => b.score - a.score || a.durationMinutes - b.durationMinutes)
    .slice(0, 3);

  return ContentService.createTextOutput(JSON.stringify(top))
    .setMimeType(ContentService.MimeType.JSON);
}

// Đọc lại điểm: teacher-review.js GET tới URL /exec?code=... khi giáo viên
// xem kết quả (REVIEW_MODE = 'sheet').
function doGet(e) {
  if (e.parameter.action === 'top') {
    return getTopScores(e.parameter.exam, e.parameter.part);
  }

  if (!e.parameter.code || e.parameter.code !== TEACHER_CODE) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Sai mật khẩu.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const body = rows.slice(1).filter((row) => row[0]);
  const result = body.map((row) => ({
    startTime: formatCell(row[0]),
    studentName: row[1],
    studentClass: row[2],
    examName: row[3],
    part: row[4],
    score: row[5],
    total: row[6],
    timestamp: formatCell(row[7]),
    durationMinutes: row[8],
  }));

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
