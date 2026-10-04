# MASTER PROMPT V2 — BÉ ĐUA XE ONLINE

Xây dựng phiên bản nâng cấp của game **Bé Đua Xe — Né Chướng Ngại Vật**.

## Mục tiêu

Game HTML5 cho trẻ em, có:
- Nhiều level.
- Power-up.
- Turbo.
- Nhiệm vụ/challenge nhẹ.
- High Score local.
- Bảng thành tích online.
- Supabase lưu điểm.
- Có thể chơi offline nếu Supabase chưa cấu hình.

## Công nghệ

Bắt buộc:
- HTML5
- CSS3
- JavaScript Vanilla ES6+
- Supabase JavaScript Client qua CDN hoặc ESM CDN.

Không dùng:
- React
- Vue
- Angular
- Node backend riêng.

## Cấu trúc

```text
car-racing-game/
├── index.html
├── styles.css
├── script.js
├── config.js
├── README.md
├── supabase-schema.sql
└── assets/
    ├── cars/
    ├── obstacles/
    ├── powerups/
    └── sounds/
```

## Chế độ hoạt động

### Offline mode

Nếu Supabase chưa cấu hình:
- Game vẫn chơi bình thường.
- Lưu high score bằng localStorage.
- Leaderboard hiển thị dữ liệu local.

### Online mode

Nếu Supabase được cấu hình:
- Gửi score lên Supabase sau Game Over.
- Đọc leaderboard.
- Hiển thị Top 10.
- Không làm game crash nếu mạng lỗi.

## Gameplay

Người chơi:
- Điều khiển xe 3 lane.
- Né obstacle.
- Thu coin.
- Dùng power-up.
- Dùng Turbo.
- Qua nhiều level.

## Level

Tối thiểu 10 level.

Level 1:
- Tốc độ thấp.
- Ít obstacle.

Level 2–3:
- Tăng tốc.

Level 4–6:
- Thêm nhiều loại obstacle.
- Power-up xuất hiện thường xuyên hơn.

Level 7–9:
- Đường chạy nhanh.
- Spawn pattern đa dạng.

Level 10:
- Boss challenge hoặc đoạn đường đặc biệt.

Mỗi level cần có:
- target score hoặc target distance.
- speed.
- spawn interval.
- obstacle frequency.

## Power-up

Tối thiểu 4 loại:

### Shield
🛡️
- Chặn một lần va chạm.
- Sau khi bị va chạm, shield biến mất.

### Magnet
🧲
- Tự hút coin trong bán kính nhất định.
- Hiệu lực 5–8 giây.

### Slow Motion
🐌
- Làm chậm obstacle.
- Hiệu lực 4–6 giây.

### Double Coin
🪙×2
- Nhân đôi giá trị coin.
- Hiệu lực 8–10 giây.

## Turbo

Turbo là cơ chế riêng với power-up.

Người chơi tích lũy Turbo Meter.

Turbo Meter tăng khi:
- Né obstacle gần.
- Thu coin.
- Chơi liên tục.

Khi đầy:
- Có thể kích hoạt Turbo.

Turbo:
- Tăng tốc xe.
- Có hiệu ứng trail.
- Tăng điểm.
- Có thể hút coin trong thời gian ngắn.
- Thời lượng 3–5 giây.

Phải có nút Turbo trên mobile.

## Combo

Nếu người chơi liên tục:
- Né obstacle.
- Thu coin.
- Không va chạm.

Combo tăng.

Ví dụ:

```text
COMBO x5
```

Combo có thể tăng multiplier điểm.

## Leaderboard

Top 10 điểm cao nhất.

Hiển thị:

```text
🏆 BẢNG THÀNH TÍCH

1. Bé An       9800
2. Bé Bin      8500
3. Bé Na       7900
...
```

Không yêu cầu email/password ở phiên bản đầu.

Người chơi nhập nickname trước khi gửi điểm.

Nickname:
- 2–15 ký tự.
- Trim whitespace.
- Chặn HTML/script.
- Không cho phép ký tự điều khiển.
- Có thể chỉ cho chữ, số, khoảng trắng và một số ký tự Unicode an toàn.

## Anti-cheat cơ bản

Không tin tưởng điểm do client gửi một cách tuyệt đối.

Ở phiên bản MVP:
- Validate score range.
- Validate level range.
- Validate nickname.
- Rate limit việc submit từ UI.
- Không cho submit liên tục.

Phiên bản production nên bổ sung Edge Function/server-side validation.

## Privacy

Không thu thập thông tin cá nhân không cần thiết.

Chỉ lưu:
- nickname.
- score.
- level.
- coins.
- created_at.

## UI

Màn hình chính:

```text
🏎️ BÉ ĐUA XE

[ CHƠI ]

[ 🏆 BẢNG THÀNH TÍCH ]

[ ⚙️ CÀI ĐẶT ]
```

Game HUD:

```text
SCORE     COIN     LEVEL
1250      24       3

🛡️  🧲  🐌  ×2

TURBO ███████░░░
```

## Tiêu chí hoàn thành

- 10 level hoạt động.
- Power-up hoạt động.
- Turbo hoạt động.
- Combo hoạt động.
- Leaderboard local hoạt động.
- Supabase schema hoạt động.
- Submit score hoạt động.
- Fetch Top 10 hoạt động.
- Offline fallback hoạt động.
- Mobile controls hoạt động.
- Không crash khi Supabase lỗi.
