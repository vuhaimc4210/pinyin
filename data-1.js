// Dữ liệu bài tập: 100 câu (75 câu 1 âm tiết + 25 từ 2 âm tiết)
// Mỗi câu 1 âm tiết: initial + final + tone -> pinyin được tính tự động (xem app.js)
// group: 'bpmf' | 'dtnl' | 'gkh' -> quyết định các đáp án nhiễu (cùng nhóm thanh mẫu)
// id: khoá cố định, dùng làm TÊN FILE AUDIO (audio/<id>.mp3) khi có phát âm chuẩn thu sẵn.
//     KHÔNG đổi id của item đã có, nếu không sẽ mất liên kết với file audio đã tải.

const SINGLES = [
  // ===== Nhóm b p m f =====
  { id: 's001', hanzi: '八', initial: 'b', final: 'a',  tone: 1, group: 'bpmf' },
  { id: 's002', hanzi: '伯', initial: 'b', final: 'o',  tone: 2, group: 'bpmf' },
  { id: 's003', hanzi: '白', initial: 'b', final: 'ai', tone: 2, group: 'bpmf' },
  { id: 's004', hanzi: '被', initial: 'b', final: 'ei', tone: 4, group: 'bpmf' },
  { id: 's005', hanzi: '包', initial: 'b', final: 'ao', tone: 1, group: 'bpmf' },
  { id: 's006', hanzi: '比', initial: 'b', final: 'i',  tone: 3, group: 'bpmf' },
  { id: 's007', hanzi: '不', initial: 'b', final: 'u',  tone: 4, group: 'bpmf' },

  { id: 's008', hanzi: '爬', initial: 'p', final: 'a',  tone: 2, group: 'bpmf' },
  { id: 's009', hanzi: '婆', initial: 'p', final: 'o',  tone: 2, group: 'bpmf' },
  { id: 's010', hanzi: '拍', initial: 'p', final: 'ai', tone: 1, group: 'bpmf' },
  { id: 's011', hanzi: '陪', initial: 'p', final: 'ei', tone: 2, group: 'bpmf' },
  { id: 's012', hanzi: '跑', initial: 'p', final: 'ao', tone: 3, group: 'bpmf' },
  { id: 's013', hanzi: '皮', initial: 'p', final: 'i',  tone: 2, group: 'bpmf' },
  { id: 's014', hanzi: '普', initial: 'p', final: 'u',  tone: 3, group: 'bpmf' },

  { id: 's015', hanzi: '妈', initial: 'm', final: 'a',  tone: 1, group: 'bpmf' },
  { id: 's016', hanzi: '摸', initial: 'm', final: 'o',  tone: 1, group: 'bpmf' },
  { id: 's017', hanzi: '买', initial: 'm', final: 'ai', tone: 3, group: 'bpmf' },
  { id: 's018', hanzi: '没', initial: 'm', final: 'ei', tone: 2, group: 'bpmf' },
  { id: 's019', hanzi: '猫', initial: 'm', final: 'ao', tone: 1, group: 'bpmf' },
  { id: 's020', hanzi: '某', initial: 'm', final: 'ou', tone: 3, group: 'bpmf' },
  { id: 's021', hanzi: '米', initial: 'm', final: 'i',  tone: 3, group: 'bpmf' },
  { id: 's022', hanzi: '母', initial: 'm', final: 'u',  tone: 3, group: 'bpmf' },

  { id: 's023', hanzi: '发', initial: 'f', final: 'a',  tone: 1, group: 'bpmf' },
  { id: 's024', hanzi: '佛', initial: 'f', final: 'o',  tone: 2, group: 'bpmf' },
  { id: 's025', hanzi: '飞', initial: 'f', final: 'ei', tone: 1, group: 'bpmf' },
  { id: 's026', hanzi: '否', initial: 'f', final: 'ou', tone: 3, group: 'bpmf' },
  { id: 's027', hanzi: '父', initial: 'f', final: 'u',  tone: 4, group: 'bpmf' },

  // ===== Nhóm d t n l =====
  { id: 's028', hanzi: '大', initial: 'd', final: 'a',  tone: 4, group: 'dtnl' },
  { id: 's029', hanzi: '得', initial: 'd', final: 'e',  tone: 2, group: 'dtnl' },
  { id: 's030', hanzi: '呆', initial: 'd', final: 'ai', tone: 1, group: 'dtnl' },
  { id: 's031', hanzi: '刀', initial: 'd', final: 'ao', tone: 1, group: 'dtnl' },
  { id: 's032', hanzi: '弟', initial: 'd', final: 'i',  tone: 4, group: 'dtnl' },
  { id: 's033', hanzi: '读', initial: 'd', final: 'u',  tone: 2, group: 'dtnl' },

  { id: 's034', hanzi: '他', initial: 't', final: 'a',  tone: 1, group: 'dtnl' },
  { id: 's035', hanzi: '特', initial: 't', final: 'e',  tone: 4, group: 'dtnl' },
  { id: 's036', hanzi: '台', initial: 't', final: 'ai', tone: 2, group: 'dtnl' },
  { id: 's037', hanzi: '讨', initial: 't', final: 'ao', tone: 3, group: 'dtnl' },
  { id: 's038', hanzi: '体', initial: 't', final: 'i',  tone: 3, group: 'dtnl' },
  { id: 's039', hanzi: '土', initial: 't', final: 'u',  tone: 3, group: 'dtnl' },

  { id: 's040', hanzi: '那', initial: 'n', final: 'a',  tone: 4, group: 'dtnl' },
  { id: 's041', hanzi: '奶', initial: 'n', final: 'ai', tone: 3, group: 'dtnl' },
  { id: 's042', hanzi: '内', initial: 'n', final: 'ei', tone: 4, group: 'dtnl' },
  { id: 's043', hanzi: '脑', initial: 'n', final: 'ao', tone: 3, group: 'dtnl' },
  { id: 's044', hanzi: '你', initial: 'n', final: 'i',  tone: 3, group: 'dtnl' },
  { id: 's045', hanzi: '努', initial: 'n', final: 'u',  tone: 3, group: 'dtnl' },
  { id: 's046', hanzi: '女', initial: 'n', final: 'ü',  tone: 3, group: 'dtnl' },

  { id: 's047', hanzi: '拉', initial: 'l', final: 'a',  tone: 1, group: 'dtnl' },
  { id: 's048', hanzi: '乐', initial: 'l', final: 'e',  tone: 4, group: 'dtnl' },
  { id: 's049', hanzi: '来', initial: 'l', final: 'ai', tone: 2, group: 'dtnl' },
  { id: 's050', hanzi: '累', initial: 'l', final: 'ei', tone: 4, group: 'dtnl' },
  { id: 's051', hanzi: '老', initial: 'l', final: 'ao', tone: 3, group: 'dtnl' },
  { id: 's052', hanzi: '楼', initial: 'l', final: 'ou', tone: 2, group: 'dtnl' },
  { id: 's053', hanzi: '里', initial: 'l', final: 'i',  tone: 3, group: 'dtnl' },
  { id: 's054', hanzi: '路', initial: 'l', final: 'u',  tone: 4, group: 'dtnl' },
  { id: 's055', hanzi: '绿', initial: 'l', final: 'ü',  tone: 4, group: 'dtnl' },

  // ===== Nhóm g k h =====
  { id: 's056', hanzi: '尬', initial: 'g', final: 'a',  tone: 4, group: 'gkh' },
  { id: 's057', hanzi: '歌', initial: 'g', final: 'e',  tone: 1, group: 'gkh' },
  { id: 's058', hanzi: '该', initial: 'g', final: 'ai', tone: 1, group: 'gkh' },
  { id: 's059', hanzi: '给', initial: 'g', final: 'ei', tone: 3, group: 'gkh' },
  { id: 's060', hanzi: '高', initial: 'g', final: 'ao', tone: 1, group: 'gkh' },
  { id: 's061', hanzi: '狗', initial: 'g', final: 'ou', tone: 3, group: 'gkh' },
  { id: 's062', hanzi: '故', initial: 'g', final: 'u',  tone: 4, group: 'gkh' },

  { id: 's063', hanzi: '卡', initial: 'k', final: 'a',  tone: 3, group: 'gkh' },
  { id: 's064', hanzi: '可', initial: 'k', final: 'e',  tone: 3, group: 'gkh' },
  { id: 's065', hanzi: '开', initial: 'k', final: 'ai', tone: 1, group: 'gkh' },
  { id: 's066', hanzi: '考', initial: 'k', final: 'ao', tone: 3, group: 'gkh' },
  { id: 's067', hanzi: '口', initial: 'k', final: 'ou', tone: 3, group: 'gkh' },
  { id: 's068', hanzi: '裤', initial: 'k', final: 'u',  tone: 4, group: 'gkh' },

  { id: 's069', hanzi: '哈', initial: 'h', final: 'a',  tone: 1, group: 'gkh' },
  { id: 's070', hanzi: '喝', initial: 'h', final: 'e',  tone: 1, group: 'gkh' },
  { id: 's071', hanzi: '孩', initial: 'h', final: 'ai', tone: 2, group: 'gkh' },
  { id: 's072', hanzi: '黑', initial: 'h', final: 'ei', tone: 1, group: 'gkh' },
  { id: 's073', hanzi: '好', initial: 'h', final: 'ao', tone: 3, group: 'gkh' },
  { id: 's074', hanzi: '后', initial: 'h', final: 'ou', tone: 4, group: 'gkh' },
  { id: 's075', hanzi: '户', initial: 'h', final: 'u',  tone: 4, group: 'gkh' },
];

// Từ 2 âm tiết (đáp án nhiễu lấy ngẫu nhiên từ chính danh sách này khi build câu hỏi)
const DOUBLES = [
  { id: 'd001', hanzi: '妈妈', pinyin: 'māma',   group: 'bpmf' },
  { id: 'd002', hanzi: '爸爸', pinyin: 'bàba',   group: 'bpmf' },
  { id: 'd003', hanzi: '弟弟', pinyin: 'dìdi',   group: 'dtnl' },
  { id: 'd004', hanzi: '老师', pinyin: 'lǎoshī', group: 'dtnl' },
  { id: 'd005', hanzi: '奶奶', pinyin: 'nǎinai', group: 'dtnl' },
  { id: 'd006', hanzi: '哥哥', pinyin: 'gēge',   group: 'gkh'  },
  { id: 'd007', hanzi: '可乐', pinyin: 'kělè',   group: 'gkh'  },
  { id: 'd008', hanzi: '鼻子', pinyin: 'bízi',   group: 'bpmf' },
  { id: 'd009', hanzi: '动物', pinyin: 'dòngwù', group: 'dtnl' },
  { id: 'd010', hanzi: '火车', pinyin: 'huǒchē', group: 'gkh'  },
  { id: 'd011', hanzi: '工作', pinyin: 'gōngzuò',group: 'gkh'  },
  { id: 'd012', hanzi: '咖啡', pinyin: 'kāfēi',  group: 'gkh'  },
  { id: 'd013', hanzi: '天气', pinyin: 'tiānqì', group: 'dtnl' },
  { id: 'd014', hanzi: '绿茶', pinyin: 'lǜchá',  group: 'dtnl' },
  { id: 'd015', hanzi: '大学', pinyin: 'dàxué',  group: 'dtnl' },
  { id: 'd016', hanzi: '朋友', pinyin: 'péngyou',group: 'bpmf' },
  { id: 'd017', hanzi: '葡萄', pinyin: 'pútáo',  group: 'bpmf' },
  { id: 'd018', hanzi: '牛奶', pinyin: 'niúnǎi', group: 'dtnl' },
  { id: 'd019', hanzi: '糊涂', pinyin: 'hútu',   group: 'gkh'  },
  { id: 'd020', hanzi: '图书', pinyin: 'túshū',  group: 'dtnl' },
  { id: 'd021', hanzi: '可怜', pinyin: 'kělián', group: 'gkh'  },
  { id: 'd022', hanzi: '地图', pinyin: 'dìtú',   group: 'dtnl' },
  { id: 'd023', hanzi: '满意', pinyin: 'mǎnyì',  group: 'bpmf' },
  { id: 'd024', hanzi: '父母', pinyin: 'fùmǔ',   group: 'bpmf' },
  { id: 'd025', hanzi: '打算', pinyin: 'dǎsuàn', group: 'dtnl' },
];

// Cho phép tools/fetch-audio.js (chạy bằng Node.js) require() được file này.
// Trên trình duyệt, biến `module` không tồn tại nên đoạn này tự động bỏ qua, không ảnh hưởng app.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SINGLES, DOUBLES };
}
