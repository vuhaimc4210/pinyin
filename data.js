// Dữ liệu bài tập bổ sung (bộ 2): 30 từ, lấy từ new-data
// Khác với data.js: giữ nguyên `pinyin` dạng chuỗi có sẵn (không tách initial/final/tone).
// group: 'bpmf' | 'dtnl' | 'gkh' -> quyết định các đáp án nhiễu (cùng nhóm thanh mẫu)
// id: khoá cố định, dùng làm TÊN FILE AUDIO (audio/<id>.mp3) khi có phát âm chuẩn thu sẵn.
//     KHÔNG đổi id của item đã có, nếu không sẽ mất liên kết với file audio đã tải.

const SINGLES = [
  // ===== Nhóm b p m f =====
  { id: 'n001', hanzi: '八', pinyin: 'bā',  group: 'bpmf' },
  { id: 'n002', hanzi: '拔', pinyin: 'bá',  group: 'bpmf' },
  { id: 'n003', hanzi: '保', pinyin: 'bǎo', group: 'bpmf' },
  { id: 'n004', hanzi: '抱', pinyin: 'bào', group: 'bpmf' },

  { id: 'n005', hanzi: '怕', pinyin: 'pà',  group: 'bpmf' },
  { id: 'n006', hanzi: '皮', pinyin: 'pí',  group: 'bpmf' },
  { id: 'n007', hanzi: '匹', pinyin: 'pǐ',  group: 'bpmf' },
  { id: 'n008', hanzi: '炮', pinyin: 'pào', group: 'bpmf' },

  { id: 'n009', hanzi: '妈', pinyin: 'mā',  group: 'bpmf' },
  { id: 'n010', hanzi: '马', pinyin: 'mǎ',  group: 'bpmf' },
  { id: 'n012', hanzi: '帽', pinyin: 'mào', group: 'bpmf' },

  { id: 'n013', hanzi: '发', pinyin: 'fā',  group: 'bpmf' },
  { id: 'n014', hanzi: '法', pinyin: 'fǎ',  group: 'bpmf' },
  { id: 'n015', hanzi: '服', pinyin: 'fú',  group: 'bpmf' },
  { id: 'n016', hanzi: '费', pinyin: 'fèi', group: 'bpmf' },

  // ===== Nhóm d t n l =====
  { id: 'n017', hanzi: '大', pinyin: 'dà',  group: 'dtnl' },
  { id: 'n018', hanzi: '弟', pinyin: 'dì',  group: 'dtnl' },
  { id: 'n019', hanzi: '度', pinyin: 'dù',  group: 'dtnl' },
  { id: 'n020', hanzi: '豆', pinyin: 'dòu', group: 'dtnl' },

  { id: 'n021', hanzi: '他', pinyin: 'tā',  group: 'dtnl' },
  { id: 'n022', hanzi: '体', pinyin: 'tǐ',  group: 'dtnl' },
  { id: 'n023', hanzi: '兔', pinyin: 'tù',  group: 'dtnl' },
  { id: 'n024', hanzi: '头', pinyin: 'tóu', group: 'dtnl' },

  { id: 'n025', hanzi: '你', pinyin: 'nǐ',  group: 'dtnl' },
  { id: 'n026', hanzi: '女', pinyin: 'nǚ',  group: 'dtnl' },
  { id: 'n027', hanzi: '闹', pinyin: 'nào', group: 'dtnl' },

  { id: 'n028', hanzi: '里', pinyin: 'lǐ',  group: 'dtnl' },

  // ===== Nhóm g k h =====
  { id: 'n030', hanzi: '高', pinyin: 'gāo', group: 'gkh' },
];

// Bộ 2 hiện chưa có từ 2 âm tiết riêng, để mảng rỗng cho đúng cấu trúc.
const DOUBLES = [];

// Cho phép tools/fetch-audio.js (chạy bằng Node.js) require() được file này.
// Trên trình duyệt, biến `module` không tồn tại nên đoạn này tự động bỏ qua, không ảnh hưởng app.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SINGLES: SINGLES, DOUBLES: DOUBLES };
}
