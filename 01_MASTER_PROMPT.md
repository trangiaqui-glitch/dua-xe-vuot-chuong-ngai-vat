# MASTER PROMPT — GAME ĐUA XE NÉ CHƯỚNG NGẠI VẬT

## 1. Vai trò

Bạn là một Senior Frontend Game Developer chuyên xây dựng mini game HTML5 cho trẻ em.

Hãy xây dựng một game web có tên **"Bé Đua Xe — Né Chướng Ngại Vật"**.

Mục tiêu:
- Game đơn giản, vui nhộn, dễ chơi.
- Phù hợp với trẻ em.
- Chạy trực tiếp trên trình duyệt.
- Không cần backend ở phiên bản đầu.
- Code dễ đọc, dễ chỉnh sửa và phù hợp cho người đang học Vibe Coding.

## 2. Công nghệ bắt buộc

Chỉ sử dụng:
- HTML5
- CSS3
- JavaScript Vanilla

Không sử dụng:
- React
- Vue
- Angular
- Node.js
- Backend
- Database
- Build tool

Có thể sử dụng Bootstrap qua CDN nếu thực sự cần, nhưng ưu tiên CSS thuần để game nhẹ.

## 3. Cấu trúc file

Tạo project:

```text
car-racing-game/
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    ├── car-player.svg
    ├── obstacle-car.svg
    ├── coin.svg
    ├── road.svg
    └── sounds/
```

Nếu không có hình ảnh thật, hãy dùng SVG/CSS để game vẫn chạy ngay.

## 4. Gameplay

Người chơi điều khiển một chiếc xe chạy trên đường.

Mục tiêu:
- Né các xe và chướng ngại vật.
- Thu thập xu để tăng điểm.
- Sống càng lâu càng tốt.
- Tốc độ tăng dần theo thời gian.

Điều khiển:
- Phím ←: sang trái.
- Phím →: sang phải.
- A: sang trái.
- D: sang phải.
- Trên mobile: có hai nút cảm ứng LEFT / RIGHT.

## 5. Luật chơi

Điểm số:
- Sống sót: +1 điểm theo thời gian.
- Thu thập coin: +10 điểm.
- Có thể tạo combo nếu thu thập nhiều coin liên tiếp.

Va chạm:
- Xe người chơi chạm chướng ngại vật => Game Over.
- Coin không gây Game Over.
- Sau Game Over hiển thị điểm hiện tại và điểm cao nhất.

## 6. Tăng độ khó

Game bắt đầu chậm.

Cứ sau một khoảng thời gian:
- Tăng tốc độ đường.
- Tăng tốc độ chướng ngại vật.
- Tăng tần suất sinh chướng ngại vật.
- Có thể tăng số lượng làn hoặc loại vật cản ở level cao.

Không được tăng khó quá nhanh khiến trẻ không thể chơi.

## 7. Màn hình

### Start Screen

Hiển thị:

```text
🏎️ BÉ ĐUA XE

Né chướng ngại vật
và thu thập thật nhiều xu!

[ BẮT ĐẦU CHƠI ]

Điều khiển:
← → hoặc A D
```

### Game Screen

Hiển thị:
- Điểm.
- High Score.
- Level.
- Coin.
- Nút Pause.

### Game Over

Hiển thị:

```text
💥 GAME OVER

Điểm: 1250
Kỷ lục: 1840

[ CHƠI LẠI ]
[ VỀ TRANG CHỦ ]
```

## 8. Thiết kế

Phong cách:
- Hoạt hình.
- Màu sắc tươi sáng.
- Thân thiện với trẻ em.
- Không có hình ảnh bạo lực.
- Không có quảng cáo.
- Không có nội dung đáng sợ.

Game phải responsive:
- Desktop.
- Tablet.
- Mobile.

## 9. Âm thanh

Nếu thêm âm thanh:
- Âm thanh bắt đầu.
- Âm thanh thu coin.
- Âm thanh va chạm.
- Âm thanh Game Over.

Phải có nút bật/tắt âm thanh.

Nếu chưa có file âm thanh, game vẫn phải hoạt động bình thường.

## 10. Yêu cầu kỹ thuật

Sử dụng `requestAnimationFrame()` cho game loop.

Tách rõ:
- Game state.
- Player.
- Obstacles.
- Coins.
- Collision detection.
- Score.
- Level.
- Rendering.
- Input handling.

Không viết toàn bộ logic vào một hàm lớn.

Game phải:
- Không tạo memory leak.
- Không tạo nhiều timer không cần thiết.
- Reset game phải reset toàn bộ state.
- Pause phải dừng animation và gameplay.
- Game Over phải dừng sinh vật thể mới.

## 11. Lưu điểm

Dùng:

```javascript
localStorage
```

để lưu:
- High Score.
- Sound On/Off.

Không cần đăng nhập.

## 12. Accessibility

- Nút đủ lớn để trẻ dễ bấm.
- Có focus state.
- Có aria-label cho nút điều khiển.
- Không phụ thuộc hoàn toàn vào hover.
- Có thể chơi bằng bàn phím.

## 13. Tiêu chí hoàn thành

Game được xem là hoàn thành khi:

1. Mở `index.html` có thể chơi ngay.
2. Xe di chuyển trái/phải.
3. Chướng ngại vật xuất hiện.
4. Có collision detection.
5. Có score.
6. Có coin.
7. Có level.
8. Có Game Over.
9. Có Restart.
10. Có High Score.
11. Có Pause.
12. Có điều khiển mobile.
13. Responsive.
14. Không có lỗi JavaScript trong Console.

Hãy ưu tiên trải nghiệm chơi đơn giản, mượt và vui nhộn thay vì nhồi quá nhiều tính năng.
