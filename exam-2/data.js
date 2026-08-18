// Dữ liệu bài tập bổ sung (exam-2): 20 từ, nhóm thanh mẫu j, q, x
// Giống data.js gốc: giữ nguyên `pinyin` dạng chuỗi có sẵn (không tách initial/final/tone).
// group: 'jqx' -> cả bộ chỉ có 1 nhóm thanh mẫu nên đáp án nhiễu lấy trong chính bộ này.
// id: khoá cố định, TRÙNG với tên file audio đã tải sẵn (audio/<id>.mp3, tính từ thư mục exam-2/).
//     KHÔNG đổi id của item đã có, nếu không sẽ mất liên kết với file audio đã tải.

const SINGLES = [
  // ===== Thanh mẫu j =====
  { id: '1.节',  hanzi: '节', pinyin: 'jié',  group: 'jqx' },
  { id: '2.脚',  hanzi: '脚', pinyin: 'jiǎo', group: 'jqx' },
  { id: '3.进',  hanzi: '进', pinyin: 'jìn',  group: 'jqx' },
  { id: '4.见',  hanzi: '见', pinyin: 'jiàn', group: 'jqx' },
  { id: '5.酒',  hanzi: '酒', pinyin: 'jiǔ',  group: 'jqx' },
  { id: '6.讲',  hanzi: '讲', pinyin: 'jiǎng',group: 'jqx' },
  { id: '7.京',  hanzi: '京', pinyin: 'jīng', group: 'jqx' },

  // ===== Thanh mẫu q =====
  { id: '8.敲',  hanzi: '敲', pinyin: 'qiāo', group: 'jqx' },
  { id: '9.亲',  hanzi: '亲', pinyin: 'qīn',  group: 'jqx' },
  { id: '10.千', hanzi: '千', pinyin: 'qiān', group: 'jqx' },
  { id: '11.抢', hanzi: '抢', pinyin: 'qiǎng',group: 'jqx' },
  { id: '12.青', hanzi: '青', pinyin: 'qīng', group: 'jqx' },

  // ===== Thanh mẫu x =====
  { id: '13.鞋', hanzi: '鞋', pinyin: 'xié',  group: 'jqx' },
  { id: '14.心', hanzi: '心', pinyin: 'xīn',  group: 'jqx' },
  { id: '15.线', hanzi: '线', pinyin: 'xiàn', group: 'jqx' },
  { id: '16.星', hanzi: '星', pinyin: 'xīng', group: 'jqx' },
  { id: '17.休', hanzi: '休', pinyin: 'xiū',  group: 'jqx' },
  { id: '18.想', hanzi: '想', pinyin: 'xiǎng',group: 'jqx' },
  { id: '19.凶', hanzi: '凶', pinyin: 'xiōng',group: 'jqx' },
  { id: '20.消', hanzi: '消', pinyin: 'xiāo', group: 'jqx' },
];

// Bộ exam-2 hiện chưa có từ 2 âm tiết riêng, để mảng rỗng cho đúng cấu trúc.
const DOUBLES = [];

// Cho phép tools/fetch-audio.js (chạy bằng Node.js) require() được file này.
// Trên trình duyệt, biến `module` không tồn tại nên đoạn này tự động bỏ qua, không ảnh hưởng app.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SINGLES: SINGLES, DOUBLES: DOUBLES };
}
