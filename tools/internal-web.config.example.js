/**
 * Cấu hình cho tools/test-internal-web.js
 *
 * Copy file này thành "internal-web.config.js" (cùng thư mục tools/) rồi điền
 * đúng theo cấu trúc trang web nội bộ của bạn. Vì đây là mạng nội bộ, mình
 * không truy cập được để tự dò selector — bạn cần tự lấy CSS selector bằng
 * DevTools (F12 -> chọn phần tử -> chuột phải -> Copy -> Copy selector).
 */
module.exports = {
  // Địa chỉ trang tạo giọng nói nội bộ của bạn
  baseUrl: 'http://192.168.1.100:8080/tts',

  // (Tuỳ chọn) Tên giọng đọc cố định muốn dùng cho cả danh sách từ. Để null
  // nếu không cần đổi giọng (dùng giọng mặc định của trang).
  voiceName: null,

  // CSS selector của các phần tử trên trang
  selectors: {
    // Ô nhập chữ Hán / văn bản cần đọc
    textInput: '#textInput',

    // Nút bấm để tạo giọng nói
    generateButton: '#generateBtn',

    // (Tuỳ chọn) Để null nếu không cần đổi giọng. Nếu trang có hộp thoại
    // chọn giọng, điền 3 selector: nút mở hộp thoại, ô tìm theo tên (script
    // sẽ gõ voiceName ở trên rồi bấm Enter), và nút Select trên dòng kết quả
    // (sẽ tự được ghép với li[data-value="<voiceName>"] để bấm đúng dòng).
    openVoiceDialog: null,
    voiceSearchInput: null,
    voiceSelectButton: null,

    // (Tuỳ chọn) Nút tải file, NẾU sau khi tạo giọng phải bấm thêm 1 nút
    // tải riêng mới có sự kiện download. Nếu bấm generateButton là tự tải
    // luôn thì để null.
    downloadButton: null,

    // (Tuỳ chọn) Nếu trang cần thời gian xử lý trước khi nút tải xuất hiện,
    // điền selector sẽ đợi xuất hiện trước khi bấm downloadButton.
    waitForSelectorBeforeDownload: null,

    // (Tuỳ chọn) Để null nếu không cần. Nếu trang thêm kết quả mới vào 1 khu
    // vực danh sách (kết quả mới nhất là phần tử con đầu tiên, có thuộc tính
    // id), điền selector của khu vực đó — script sẽ tự lấy id của kết quả
    // đầu tiên rồi bấm link tải (thẻ a) có href chứa "prj=<id>" đó.
    resultArea: null,
  },

  // Thời gian nghỉ SAU KHI đã nhập chữ vào ô textInput, TRƯỚC KHI bấm
  // generateButton (mili giây). Dùng để mô phỏng người dùng thật gõ xong
  // mới bấm, hoặc chờ trang xử lý validate ô nhập.
  delayAfterFillMs: 1000,

  // Thời gian nghỉ giữa mỗi từ (mili giây). Mặc định 10000 = 10 giây.
  delayMs: 10000,

  // true = chạy ẩn (headless), false = mở cửa sổ trình duyệt để bạn quan sát
  // trong lúc test. Nên để false khi mới test lần đầu.
  headless: false,

  // Timeout chờ sự kiện tải file xuất hiện sau khi bấm nút tạo (mili giây)
  downloadTimeoutMs: 30000,
};
