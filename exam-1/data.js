// Dữ liệu bài 1.1 (b p m f · d t n l · g k h): 30 từ, độc lập hoàn toàn — không
// tham chiếu chéo sang thư mục nào khác (kể cả data.js gốc ở thư mục root).
// group: 'bpmf' | 'dtnl' | 'gkh' -> quyết định các đáp án nhiễu cùng nhóm thanh mẫu.
// id: khoá cố định, TRÙNG với tên file audio (audio/<id>.mp3, tính từ thư mục exam-1/ này).
//     KHÔNG đổi id của item đã có, nếu không sẽ mất liên kết với file audio.
// Lưu ý #30: file audio là "30.狗.mp3" (gǒu - con chó), khác với data-origin.txt gốc
// ghi nhầm là "够 (gòu - đủ)". Đã sửa theo audio vì đó là bản ghi thật.

const SINGLES = [
  // ===== Thanh mẫu b =====
  { id: '1.八',  hanzi: '八', pinyin: 'bā',  group: 'bpmf' },
  { id: '2.白',  hanzi: '白', pinyin: 'bái', group: 'bpmf' },
  { id: '23.不', hanzi: '不', pinyin: 'bù',  group: 'bpmf' },

  // ===== Thanh mẫu p =====
  { id: '3.跑',  hanzi: '跑', pinyin: 'pǎo', group: 'bpmf' },
  { id: '4.皮',  hanzi: '皮', pinyin: 'pí',  group: 'bpmf' },
  { id: '24.扑', hanzi: '扑', pinyin: 'pū',  group: 'bpmf' },

  // ===== Thanh mẫu m =====
  { id: '5.妈',  hanzi: '妈', pinyin: 'mā',  group: 'bpmf' },
  { id: '6.米',  hanzi: '米', pinyin: 'mǐ',  group: 'bpmf' },
  { id: '25.买', hanzi: '买', pinyin: 'mǎi', group: 'bpmf' },
  { id: '29.猫', hanzi: '猫', pinyin: 'māo', group: 'bpmf' },

  // ===== Thanh mẫu f =====
  { id: '7.飞',  hanzi: '飞', pinyin: 'fēi', group: 'bpmf' },
  { id: '8.副',  hanzi: '副', pinyin: 'fù',  group: 'bpmf' },

  // ===== Thanh mẫu d =====
  { id: '9.大',  hanzi: '大', pinyin: 'dà',  group: 'dtnl' },
  { id: '10.到', hanzi: '到', pinyin: 'dào', group: 'dtnl' },
  { id: '26.带', hanzi: '带', pinyin: 'dài', group: 'dtnl' },

  // ===== Thanh mẫu t =====
  { id: '11.他', hanzi: '他', pinyin: 'tā',  group: 'dtnl' },
  { id: '12.头', hanzi: '头', pinyin: 'tóu', group: 'dtnl' },
  { id: '27.台', hanzi: '台', pinyin: 'tái', group: 'dtnl' },

  // ===== Thanh mẫu n =====
  { id: '13.你', hanzi: '你', pinyin: 'nǐ',  group: 'dtnl' },
  { id: '14.拿', hanzi: '拿', pinyin: 'ná',  group: 'dtnl' },

  // ===== Thanh mẫu l =====
  { id: '15.拉', hanzi: '拉', pinyin: 'lā',  group: 'dtnl' },
  { id: '16.力', hanzi: '力', pinyin: 'lì',  group: 'dtnl' },
  { id: '28.绿', hanzi: '绿', pinyin: 'lǜ',  group: 'dtnl' },

  // ===== Thanh mẫu g =====
  { id: '17.哥', hanzi: '哥', pinyin: 'gē',  group: 'gkh' },
  { id: '18.高', hanzi: '高', pinyin: 'gāo', group: 'gkh' },
  { id: '30.狗', hanzi: '狗', pinyin: 'gǒu', group: 'gkh' },

  // ===== Thanh mẫu k =====
  { id: '19.科', hanzi: '科', pinyin: 'kē',  group: 'gkh' },
  { id: '20.口', hanzi: '口', pinyin: 'kǒu', group: 'gkh' },

  // ===== Thanh mẫu h =====
  { id: '21.哈', hanzi: '哈', pinyin: 'hā',  group: 'gkh' },
  { id: '22.好', hanzi: '好', pinyin: 'hǎo', group: 'gkh' },
];

// Cho phép tools/fetch-audio.js (chạy bằng Node.js) require() được file này.
// Trên trình duyệt, biến `module` không tồn tại nên đoạn này tự động bỏ qua, không ảnh hưởng app.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SINGLES: SINGLES };
}
