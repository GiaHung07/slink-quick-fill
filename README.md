# S-Link Quick Fill

Userscript hỗ trợ điền nhanh các mục bắt buộc trong khảo sát S-Link.

- Chỉ điền các câu bắt buộc.
- Không ghi đè đáp án đã chọn.
- Không tự nộp khảo sát.
- Có thể chỉnh nhanh năm học và mức điểm ở đầu file.

## Cài đặt

1. Cài Tampermonkey.
2. Mở file `slink-quick-fill.user.js`.
3. Bấm `Install`.
4. Mở trang khảo sát S-Link.
5. Bấm `Điền Nhanh`.

## Cấu hình

Sửa các dòng ở đầu script:

```js
const YEAR = 2;      // 1-4
const SCORE_5 = 0;   // 0 = random 4-5 | hoặc 4 / 5
const SCORE_10 = 0;  // 0 = random 8-10 | hoặc 8 / 9 / 10
