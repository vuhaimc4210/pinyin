// Dữ liệu bài 3 (z c s zh ch sh r): 20 từ, độc lập hoàn toàn — không tham chiếu
// chéo sang thư mục nào khác.
// group: 'zcs' -> thanh mẫu z/c/s (âm đầu lưỡi trước - bình thiệt).
//        'zhchshr' -> thanh mẫu zh/ch/sh/r (âm đầu lưỡi cong - quyển thiệt).
// id: khoá cố định, TRÙNG với tên file audio (audio/<id>.mp3, tính từ thư mục exam-3/ này).
//     KHÔNG đổi id của item đã có, nếu không sẽ mất liên kết với file audio.

const SINGLES = [
  // ===== Thanh mẫu z =====
  { id: '1.在',  hanzi: '在', pinyin: 'zài',  group: 'zcs' },
  { id: '2.怎',  hanzi: '怎', pinyin: 'zěn',  group: 'zcs' },
  { id: '3.脏',  hanzi: '脏', pinyin: 'zāng', group: 'zcs' },

  // ===== Thanh mẫu s =====
  { id: '4.丝',  hanzi: '丝', pinyin: 'sī',   group: 'zcs' },
  { id: '5.色',  hanzi: '色', pinyin: 'sè',   group: 'zcs' },
  { id: '6.扫',  hanzi: '扫', pinyin: 'sǎo',  group: 'zcs' },
  { id: '7.僧',  hanzi: '僧', pinyin: 'sēng', group: 'zcs' },

  // ===== Thanh mẫu c =====
  { id: '8.菜',  hanzi: '菜', pinyin: 'cài',  group: 'zcs' },
  { id: '9.草',  hanzi: '草', pinyin: 'cǎo',  group: 'zcs' },
  { id: '10.从', hanzi: '从', pinyin: 'cóng', group: 'zcs' },

  // ===== Thanh mẫu zh =====
  { id: '11.宅', hanzi: '宅', pinyin: 'zhái',  group: 'zhchshr' },
  { id: '12.争', hanzi: '争', pinyin: 'zhēng', group: 'zhchshr' },

  // ===== Thanh mẫu ch =====
  { id: '13.吵', hanzi: '吵', pinyin: 'chǎo', group: 'zhchshr' },
  { id: '14.晨', hanzi: '晨', pinyin: 'chén', group: 'zhchshr' },

  // ===== Thanh mẫu sh =====
  { id: '15.晒', hanzi: '晒', pinyin: 'shài',  group: 'zhchshr' },
  { id: '16.生', hanzi: '生', pinyin: 'shēng', group: 'zhchshr' },
  { id: '17.手', hanzi: '手', pinyin: 'shǒu',  group: 'zhchshr' },

  // ===== Thanh mẫu r =====
  { id: '18.认', hanzi: '认', pinyin: 'rèn',  group: 'zhchshr' },
  { id: '19.让', hanzi: '让', pinyin: 'ràng', group: 'zhchshr' },
  { id: '20.肉', hanzi: '肉', pinyin: 'ròu',  group: 'zhchshr' },
];

// Cho phép tools/fetch-audio.js (chạy bằng Node.js) require() được file này.
// Trên trình duyệt, biến `module` không tồn tại nên đoạn này tự động bỏ qua, không ảnh hưởng app.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SINGLES: SINGLES };
}
