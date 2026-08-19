// Dữ liệu bài 3 (z c s zh ch sh r): 20 từ, độc lập hoàn toàn — không tham chiếu
// chéo sang thư mục nào khác.
// group: 'zcs' -> thanh mẫu z/c/s (âm đầu lưỡi trước - bình thiệt).
//        'zhchshr' -> thanh mẫu zh/ch/sh/r (âm đầu lưỡi cong - quyển thiệt).
// meaning: nghĩa tiếng Việt, lấy từ data-origin.txt, hiển thị trong feedback sau khi chọn đáp án.
// id: khoá cố định, TRÙNG với tên file audio (audio/<id>.mp3, tính từ thư mục exam-3/ này).
//     KHÔNG đổi id của item đã có, nếu không sẽ mất liên kết với file audio.

const SINGLES = [
  // ===== Thanh mẫu z =====
  { id: '1.在',  hanzi: '在', pinyin: 'zài',  group: 'zcs', meaning: 'Ở, tại' },
  { id: '2.怎',  hanzi: '怎', pinyin: 'zěn',  group: 'zcs', meaning: 'Sao, thế nào' },
  { id: '3.脏',  hanzi: '脏', pinyin: 'zāng', group: 'zcs', meaning: 'Bẩn thỉu' },

  // ===== Thanh mẫu s =====
  { id: '4.丝',  hanzi: '丝', pinyin: 'sī',   group: 'zcs', meaning: 'Sợi, tơ' },
  { id: '5.色',  hanzi: '色', pinyin: 'sè',   group: 'zcs', meaning: 'Màu sắc' },
  { id: '6.扫',  hanzi: '扫', pinyin: 'sǎo',  group: 'zcs', meaning: 'Quét' },
  { id: '7.僧',  hanzi: '僧', pinyin: 'sēng', group: 'zcs', meaning: 'Nhà sư' },

  // ===== Thanh mẫu c =====
  { id: '8.菜',  hanzi: '菜', pinyin: 'cài',  group: 'zcs', meaning: 'Rau, món ăn' },
  { id: '9.草',  hanzi: '草', pinyin: 'cǎo',  group: 'zcs', meaning: 'Cỏ' },
  { id: '10.从', hanzi: '从', pinyin: 'cóng', group: 'zcs', meaning: 'Từ, theo' },

  // ===== Thanh mẫu zh =====
  { id: '11.宅', hanzi: '宅', pinyin: 'zhái',  group: 'zhchshr', meaning: 'Nhà ở, trạch nam' },
  { id: '12.争', hanzi: '争', pinyin: 'zhēng', group: 'zhchshr', meaning: 'Tranh giành, đấu tranh' },

  // ===== Thanh mẫu ch =====
  { id: '13.吵', hanzi: '吵', pinyin: 'chǎo', group: 'zhchshr', meaning: 'Cãi nhau, ồn ào' },
  { id: '14.晨', hanzi: '晨', pinyin: 'chén', group: 'zhchshr', meaning: 'Buổi sáng, sáng sớm' },

  // ===== Thanh mẫu sh =====
  { id: '15.晒', hanzi: '晒', pinyin: 'shài',  group: 'zhchshr', meaning: 'Phơi nắng' },
  { id: '16.生', hanzi: '生', pinyin: 'shēng', group: 'zhchshr', meaning: 'Sinh ra, học sinh' },
  { id: '17.手', hanzi: '手', pinyin: 'shǒu',  group: 'zhchshr', meaning: 'Tay' },

  // ===== Thanh mẫu r =====
  { id: '18.认', hanzi: '认', pinyin: 'rèn',  group: 'zhchshr', meaning: 'Nhận biết, thừa nhận' },
  { id: '19.让', hanzi: '让', pinyin: 'ràng', group: 'zhchshr', meaning: 'Nhường, để cho, khiến cho' },
  { id: '20.肉', hanzi: '肉', pinyin: 'ròu',  group: 'zhchshr', meaning: 'Thịt' },
];

// Cho phép tools/fetch-audio.js (chạy bằng Node.js) require() được file này.
// Trên trình duyệt, biến `module` không tồn tại nên đoạn này tự động bỏ qua, không ảnh hưởng app.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SINGLES: SINGLES };
}
