# Test 5 từ — lấy audio mẫu từ speechgen.io

Mục tiêu: kiểm tra nhanh luồng "web check có file audio → dùng file, không có → fallback TTS"
trước khi làm hết 100 từ. Chỉ cần **5 file**, nằm trong quota miễn phí (không cần token API).

## Trang & giọng đọc

- Trang: https://speechgen.io/vi/tts-chinese-wu-simplified/
- Chọn giọng: **Xiaoyin**. **Không chọn "Xiaoxiao Dialects"** vì mặc định đọc theo phương ngữ Ngô.
- Định dạng tải về: **mp3**.

## 5 từ cần tạo

5 từ này được chọn để phủ đủ các trường hợp: 3 nhóm thanh mẫu (b p m f / d t n l / g k h),
1 từ có vận mẫu đặc biệt (ü), và 1 từ 2 âm tiết.

| id (giữ nguyên) | Chữ Hán cần nhập | Pinyin đúng | Nhóm | Tên file cần lưu |
|---|---|---|---|---|
| s001 | 八 | bā | bpmf | `s001.mp3` |
| s029 | 得 | dé | dtnl | `s029.mp3` |
| s060 | 高 | gāo | gkh | `s060.mp3` |
| s046 | 女 | nǚ | dtnl (vận mẫu ü) | `s046.mp3` |
| d001 | 妈妈 | māma | bpmf (từ 2 âm tiết) | `d001.mp3` |

## Các bước

1. Vào trang speechgen.io, chọn giọng Yunxi.
2. Với từng dòng trong bảng: nhập đúng cột **"Chữ Hán cần nhập"** vào ô văn bản → bấm tạo giọng
   nói → tải file mp3 về máy.
3. Đổi tên file vừa tải đúng theo cột **"Tên file cần lưu"** (ví dụ file tải về cho 八 phải đổi
   tên thành `s001.mp3`).
4. Trả về đủ 5 file mp3 đã đổi tên (`s001.mp3`, `s029.mp3`, `s060.mp3`, `s046.mp3`, `d001.mp3`).

## Sau khi có 5 file

Đưa 5 file trở lại cho phiên làm việc chính — sẽ tự đặt vào thư mục `audio/` và test thử trong
`index.html`. Nếu cả 5 câu tương ứng phát đúng giọng vừa tải (thay vì giọng máy tổng hợp mặc
định) → xác nhận toàn bộ luồng (đặt tên file theo `id`, web tự nhận diện, fallback khi thiếu)
hoạt động chính xác. Lúc đó có thể yên tâm nạp tiền lấy token và chạy `tools/fetch-audio.js` cho
đủ 100 từ mà không lo sai luồng giữa chừng.
