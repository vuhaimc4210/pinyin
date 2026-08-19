// Dữ liệu bài 2 (ôn tập j q x): 20 từ, độc lập hoàn toàn — không tham chiếu
// chéo sang thư mục nào khác.
// group: 'jqx' -> cả bộ chỉ có 1 nhóm thanh mẫu nên đáp án nhiễu lấy trong chính bộ này.
// meaning: nghĩa tiếng Việt, lấy từ exam-2-old/data.txt, hiển thị trong feedback sau khi chọn đáp án.
// id: khoá cố định, TRÙNG với tên file audio (audio/<id>.mp3, tính từ thư mục exam-2/ này).
//     KHÔNG đổi id của item đã có, nếu không sẽ mất liên kết với file audio.

const SINGLES = [
  // ===== Thanh mẫu j =====
  { id: '1.节',  hanzi: '节', pinyin: 'jié',  group: 'jqx', meaning: 'Ngày lễ, tiết trời' },
  { id: '2.脚',  hanzi: '脚', pinyin: 'jiǎo', group: 'jqx', meaning: 'Chân' },
  { id: '3.进',  hanzi: '进', pinyin: 'jìn',  group: 'jqx', meaning: 'Tiến vào' },
  { id: '4.见',  hanzi: '见', pinyin: 'jiàn', group: 'jqx', meaning: 'Nhìn thấy' },
  { id: '5.酒',  hanzi: '酒', pinyin: 'jiǔ',  group: 'jqx', meaning: 'Rượu' },
  { id: '6.讲',  hanzi: '讲', pinyin: 'jiǎng',group: 'jqx', meaning: 'Nói, giảng giải' },
  { id: '7.京',  hanzi: '京', pinyin: 'jīng', group: 'jqx', meaning: 'Thủ đô' },

  // ===== Thanh mẫu q =====
  { id: '8.敲',  hanzi: '敲', pinyin: 'qiāo', group: 'jqx', meaning: 'Gõ' },
  { id: '9.亲',  hanzi: '亲', pinyin: 'qīn',  group: 'jqx', meaning: 'Thân thiết, họ hàng' },
  { id: '10.千', hanzi: '千', pinyin: 'qiān', group: 'jqx', meaning: 'Số một nghìn' },
  { id: '11.抢', hanzi: '抢', pinyin: 'qiǎng',group: 'jqx', meaning: 'Cướp, tranh giành' },
  { id: '12.青', hanzi: '青', pinyin: 'qīng', group: 'jqx', meaning: 'Màu xanh' },

  // ===== Thanh mẫu x =====
  { id: '13.鞋', hanzi: '鞋', pinyin: 'xié',  group: 'jqx', meaning: 'Giày' },
  { id: '14.心', hanzi: '心', pinyin: 'xīn',  group: 'jqx', meaning: 'Tim, tấm lòng' },
  { id: '15.线', hanzi: '线', pinyin: 'xiàn', group: 'jqx', meaning: 'Sợi chỉ, tuyến' },
  { id: '16.星', hanzi: '星', pinyin: 'xīng', group: 'jqx', meaning: 'Ngôi sao' },
  { id: '17.休', hanzi: '休', pinyin: 'xiū',  group: 'jqx', meaning: 'Nghỉ ngơi' },
  { id: '18.想', hanzi: '想', pinyin: 'xiǎng',group: 'jqx', meaning: 'Nghĩ, muốn' },
  { id: '19.凶', hanzi: '凶', pinyin: 'xiōng',group: 'jqx', meaning: 'Hung ác' },
  { id: '20.消', hanzi: '消', pinyin: 'xiāo', group: 'jqx', meaning: 'Tiêu tan, tiêu diệt' },
];

// Cho phép tools/fetch-audio.js (chạy bằng Node.js) require() được file này.
// Trên trình duyệt, biến `module` không tồn tại nên đoạn này tự động bỏ qua, không ảnh hưởng app.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SINGLES: SINGLES };
}
