// Cấu hình dùng chung cho cả 3 bài luyện tập (app.js) và trang xem lại của
// giáo viên (teacher-review.js). Trang không có bước build nên không đọc
// được file .env thật — dùng hằng số JS này thay thế. URL này KHÔNG bí mật
// (nó lộ ra trong mã nguồn phía trình duyệt); phần chặn truy cập thật sự nằm
// ở TEACHER_CODE kiểm tra trong Apps Script.
//
// Cách lấy URL:
//   1. Import file ket-qua-hoc-sinh.xlsx thành 1 Google Sheet (giữ nguyên
//      dòng tiêu đề: Thời gian, Tên, Tên bài, Phần, Số điểm, Tổng số câu).
//   2. Trong Google Sheet: Tiện ích mở rộng > Apps Script, xoá nội dung mặc
//      định rồi dán toàn bộ file google-apps-script.gs (cùng thư mục với
//      file này) vào.
//   3. Lưu, bấm Triển khai (Deploy) > Deployment mới > loại "Ứng dụng web"
//      (Web app) > Người có quyền truy cập: "Bất kỳ ai" (Anyone). Bấm
//      Triển khai, cấp quyền khi được hỏi, rồi copy URL kết thúc bằng
//      "/exec" dán vào bên dưới.
//   4. Deploy lại trang web (đổi giá trị này rồi push code).
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxoV8YVsqF8NfI9AF28fwBGM069egPnOSd6ouI3-2Hm9lvyWTf02UVNLblA4LIBwnM3/exec'; // vd: 'https://script.google.com/macros/s/AKfycb.../exec'
