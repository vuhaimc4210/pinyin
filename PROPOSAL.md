# Đề xuất nâng cấp Web luyện nghe Pinyin

> Mục tiêu: tách nội dung bài học (bộ câu hỏi + audio chuẩn) ra khỏi mã nguồn ứng dụng, để sau này có thể **thay bộ 100 câu khác, đổi nhóm thanh mẫu khác, hoặc gắn file phát âm chuẩn** mà không cần sửa code — chỉ cần thay 1 file dữ liệu (và thêm file audio) theo đúng khuôn mẫu.

---

## 1. Hiện trạng & hạn chế

Bản hiện tại (`data.js` + `app.js`) có các giới hạn khi muốn mở rộng:

| Hạn chế | Chi tiết |
|---|---|
| Dữ liệu gắn cứng trong code | `SINGLES`/`DOUBLES` là biến JS trong `data.js`, người không biết lập trình khó chỉnh sửa an toàn |
| Nhóm thanh mẫu cố định | `GROUP_INITIALS` trong `app.js` hard-code 3 nhóm `bpmf/dtnl/gkh` — muốn thêm nhóm khác (vd. `zh ch sh r`, `j q x`) phải sửa code |
| Không có audio chuẩn | Âm thanh phát ra là do trình duyệt tổng hợp (Web Speech API), phát âm phụ thuộc máy người dùng, không đảm bảo chuẩn |
| Không có cơ chế đổi bộ đề | Muốn đổi 100 câu khác phải sửa trực tiếp file đang chạy, dễ gây lỗi, không backup |
| Không kiểm tra hợp lệ | Không có bước nào tự động phát hiện dữ liệu sai (thiếu field, sai thanh điệu, trùng id...) trước khi đưa vào dùng |

---

## 2. Kiến trúc đề xuất

### 2.1. Nguyên tắc

- **Tách rời hoàn toàn**: mã nguồn ứng dụng (`app.js`, `style.css`, `index.html`) không chứa nội dung câu hỏi. Toàn bộ nội dung nằm trong file dữ liệu `.json` độc lập.
- **Bộ đề (question set)** = 1 file JSON mô tả: nhóm thanh mẫu áp dụng + danh sách câu hỏi + đường dẫn audio.
- **Nhiều bộ đề cùng tồn tại**: có thể có nhiều file bộ đề, người dùng chọn bộ muốn luyện qua dropdown, không cần xoá bộ cũ khi thêm bộ mới.
- **Audio là "chuẩn", TTS là "dự phòng"**: nếu câu hỏi có file audio → phát file đó (giọng chuẩn đã thu). Nếu chưa có (giai đoạn đầu, "sẽ bổ sung sau") → tự động phát bằng giọng đọc trình duyệt (TTS) như hiện tại, để app vẫn dùng được ngay trong lúc chờ thu âm.

### 2.2. Cấu trúc thư mục đề xuất

```
Web-TQ/
├── index.html
├── style.css
├── app.js                          # logic app — KHÔNG chứa nội dung câu hỏi
│
├── data/
│   ├── manifest.json                # danh sách các bộ đề hiện có
│   ├── bpmf-dtnl-gkh-v1.json         # bộ đề hiện tại (100 câu, đang dùng)
│   └── backup/                      # bản sao các phiên bản cũ trước khi bị thay
│       └── bpmf-dtnl-gkh-v1_2026-08-15.json
│
├── audio/
│   └── bpmf-dtnl-gkh-v1/            # audio khớp với từng bộ đề, đặt tên theo id câu hỏi
│       ├── s001.mp3
│       ├── s002.mp3
│       └── ...
│
├── tools/
│   └── validate-data.js             # script admin chạy để kiểm tra file trước khi thay
│
└── PROPOSAL.md                      # tài liệu này
```

### 2.3. Schema dữ liệu — file 1 bộ đề (`data/*.json`)

```jsonc
{
  "setId": "bpmf-dtnl-gkh-v1",
  "name": "Thanh mẫu b p m f · d t n l · g k h",
  "version": "1.0",
  "updatedAt": "2026-08-15",
  "audioBasePath": "audio/bpmf-dtnl-gkh-v1/",

  // Định nghĩa nhóm thanh mẫu — KHÔNG hard-code trong app.js nữa.
  // Muốn đổi bộ thanh mẫu khác (vd j q x / zh ch sh r) chỉ cần sửa ở đây.
  "groups": {
    "bpmf": { "label": "b p m f", "initials": ["b", "p", "m", "f"] },
    "dtnl": { "label": "d t n l", "initials": ["d", "t", "n", "l"] },
    "gkh":  { "label": "g k h",   "initials": ["g", "k", "h"] }
  },

  "questions": [
    {
      "id": "s001",
      "type": "single",              // "single" (1 âm tiết) | "double" (2 âm tiết / từ)
      "hanzi": "八",
      "pinyin": "bā",                 // pinyin đầy đủ có dấu — LƯU RÕ, không tự tính ngầm
      "group": "bpmf",
      "initial": "b",
      "final": "a",
      "tone": 1,
      "audioFile": "s001.mp3",        // rỗng "" hoặc null nếu CHƯA có file -> app tự dùng TTS
      "options": null                 // null -> app tự sinh 3-4 đáp án nhiễu theo "group"
                                       // hoặc admin tự điền mảng string để chỉ định cứng đáp án
    },
    {
      "id": "d001",
      "type": "double",
      "hanzi": "妈妈",
      "pinyin": "māma",
      "group": "bpmf",
      "audioFile": null,
      "options": null
    }
  ]
}
```

**Vì sao lưu `pinyin` tường minh thay vì để app tự tính từ `initial+final+tone`?**
Để admin (không rành code) có thể tự đọc/kiểm tra trực tiếp trong file JSON mà không cần hiểu thuật toán đánh dấu thanh điệu. App vẫn có thể tự tính để **đối chiếu chéo** (cảnh báo nếu `pinyin` ghi tay không khớp công thức) trong bước validate.

### 2.4. `data/manifest.json` — danh mục các bộ đề

```jsonc
{
  "sets": [
    {
      "id": "bpmf-dtnl-gkh-v1",
      "name": "Thanh mẫu b p m f · d t n l · g k h",
      "file": "data/bpmf-dtnl-gkh-v1.json",
      "totalQuestions": 100,
      "updatedAt": "2026-08-15"
    }
  ]
}
```

App load `manifest.json` khi khởi động → hiển thị dropdown "Chọn bộ đề" (bên cạnh dropdown chọn giọng đọc hiện có) → khi người dùng chọn, app `fetch()` đúng file trong `file` để build câu hỏi. Thêm bộ đề mới = thêm 1 dòng vào `manifest.json` + 1 file JSON mới, **không đụng vào bộ cũ**.

### 2.5. Quy tắc đặt tên & phát audio

- Tên file audio = **`<id>.mp3`**, khớp đúng field `id` trong câu hỏi → không nhầm lẫn dù pinyin trùng nhau hay có dấu khó gõ tên file.
- Định dạng: `.mp3` (nhẹ, hỗ trợ rộng). Có thể đổi sang `.ogg`/`.wav` nếu cần, chỉ cần thống nhất 1 định dạng cho cả bộ.
- Logic phát âm trong app (khái quát):
  ```js
  async function playAudio(question) {
    if (question.audioFile) {
      const audio = new Audio(currentSet.audioBasePath + question.audioFile);
      audio.playbackRate = currentSpeed;      // dùng chung thanh trượt 0.25x–0.70x
      try { await audio.play(); return; } catch (e) { /* file lỗi/thiếu -> rơi xuống TTS */ }
    }
    speakWithTTS(question.hanzi);              // dự phòng như hiện tại
  }
  ```
- Nhờ vậy: **chưa có audio → app vẫn chạy bằng TTS ngay hôm nay**; khi nào có file thật, chỉ cần đặt đúng tên vào đúng thư mục + điền `audioFile` trong JSON, không cần sửa code.

---

## 3. Quy trình Admin cập nhật dữ liệu thủ công

1. **Copy file bộ đề hiện tại** làm mẫu (giữ đúng cấu trúc field).
2. **Chỉnh sửa nội dung**: sửa/thêm/xoá câu hỏi trong mảng `questions`, hoặc đổi hẳn `groups` nếu muốn luyện thanh mẫu khác.
3. **Chạy script kiểm tra** `tools/validate-data.js` trước khi đưa vào dùng, script kiểm tra:
   - JSON đúng cú pháp.
   - Mỗi câu hỏi có đủ field bắt buộc (`id`, `hanzi`, `pinyin`, `group`...).
   - `group` của mỗi câu phải tồn tại trong `groups`.
   - `tone` chỉ trong khoảng 1–4.
   - `id` không trùng lặp trong toàn bộ đề.
   - `pinyin` ghi tay khớp với `initial+final+tone` tính ra (cảnh báo nếu lệch, để bắt lỗi gõ sai dấu).
   - Nếu `audioFile` có giá trị nhưng file không tồn tại trong thư mục `audio/` → **cảnh báo** (không chặn, vì "audio bổ sung sau" là hợp lệ), để admin biết còn thiếu bao nhiêu file cần thu âm.
   - Script xuất báo cáo dạng: `✅ Hợp lệ` hoặc danh sách lỗi/cảnh báo kèm số dòng.
4. **Bổ sung file audio** (nếu có) vào đúng thư mục `audio/<setId>/`, đặt tên đúng theo `id`.
5. **Cập nhật `manifest.json`**: bump `version`/`updatedAt`, hoặc thêm bộ đề mới nếu đây là bộ song song (không thay bộ cũ).
6. **Backup file cũ** vào `data/backup/` (kèm ngày) trước khi ghi đè, để có thể khôi phục nếu bộ mới có vấn đề.
7. **Test thử trong app** (chọn đúng bộ đề vừa cập nhật, làm thử vài câu) trước khi coi là chính thức.

### Gợi ý bổ sung (tuỳ chọn, giai đoạn sau)
- Cho phép admin soạn nội dung trong **file Excel** (cột: id, hanzi, pinyin, group, initial, final, tone, audioFile) thay vì sửa JSON tay — dễ thao tác hàng loạt, ít lỗi cú pháp — sau đó dùng 1 script chuyển đổi Excel → JSON đúng schema rồi mới chạy `validate-data.js`.
- Ghi log lịch sử thay đổi bộ đề (ai sửa, khi nào) nếu có nhiều admin cùng cập nhật.

---

## 4. Kế hoạch triển khai (từng bước)

| Giai đoạn | Nội dung |
|---|---|
| **Phase 1** | Chuyển `SINGLES`/`DOUBLES` hiện tại trong `data.js` sang đúng schema JSON mới (`data/bpmf-dtnl-gkh-v1.json` + `data/manifest.json`), giữ nguyên 100 câu đang có, chưa có audio (dùng TTS như hiện tại) |
| **Phase 2** | Sửa `app.js`: đọc `manifest.json` → cho chọn bộ đề; đọc `groups` động thay vì hard-code `GROUP_INITIALS`; thêm hàm `playAudio()` có fallback TTS |
| **Phase 3** | Viết `tools/validate-data.js`; viết hướng dẫn thao tác cho admin (README riêng hoặc phần trong tài liệu này) |
| **Phase 4** | Bổ sung dần file audio thật vào thư mục `audio/bpmf-dtnl-gkh-v1/`, điền field `audioFile` tương ứng |
| **Phase 5 (tuỳ chọn)** | Thêm bộ đề mới (nhóm thanh mẫu khác) song song, kiểm thử bằng dropdown chọn bộ đề |

---

## 5. Vấn đề cần bạn xác nhận trước khi triển khai code

1. **Định dạng audio**: dùng `.mp3` có ổn không, hay cần định dạng khác?
2. **Nguồn thu âm chuẩn**: audio sẽ do người thật thu, hay xuất từ 1 dịch vụ TTS trả phí (như speechgen.io) rồi tải file `.mp3` về đặt vào thư mục? (Nếu dùng speechgen.io, quy trình sẽ là: admin tự tải file `.mp3` từng câu về, đặt đúng tên `id.mp3` — không tự động hoá được vì không có API công khai miễn phí.)
3. **Có cần giữ lịch sử nhiều phiên bản bộ đề** (để rollback) hay chỉ cần backup gần nhất là đủ?
4. **Có cần nhiều bộ đề tồn tại song song** (người học chọn bộ để luyện) hay mục tiêu chỉ là **thay thế** bộ 100 câu hiện tại mỗi lần cập nhật (ghi đè, không giữ bộ cũ)?
5. **Ai là "admin"**: có rành sửa JSON trực tiếp không, hay nên ưu tiên làm luôn phương án soạn bằng Excel rồi convert (đỡ lỗi cú pháp hơn)?

Sau khi bạn chốt các câu hỏi trên, mình sẽ triển khai code theo đúng kế hoạch ở mục 4.
