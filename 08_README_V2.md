# 🏎️ BÉ ĐUA XE V2

Phiên bản nâng cấp của game né chướng ngại vật.

## Tính năng

### Gameplay
- 10 level.
- 3 lane.
- Obstacle.
- Coin.
- Combo.

### Power-up
- 🛡️ Shield.
- 🧲 Magnet.
- 🐌 Slow Motion.
- 🪙 Double Coin.

### Turbo
- Turbo Meter.
- Turbo Boost.
- Mobile Turbo button.

### Thành tích
- Local High Score.
- Local Leaderboard.
- Online Leaderboard.

### Supabase
- Lưu score.
- Lấy Top 10.
- Offline fallback.

## Cấu hình Supabase

1. Tạo project Supabase.
2. Chạy file `supabase-schema.sql`.
3. Lấy Project URL.
4. Lấy anon/public key.
5. Điền vào `config.js`.

Ví dụ:

```javascript
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "ey...";
```

Không sử dụng service_role key ở frontend.

## Chạy

MVP có thể mở `index.html`.

Nếu trình duyệt hạn chế module/CDN khi mở bằng `file://`, chạy bằng một static server đơn giản.

Ví dụ VS Code:
- Cài Live Server.
- Open with Live Server.

## Roadmap

### V2.1
- Daily challenge.
- More cars.
- More maps.

### V2.2
- Anonymous authentication.
- Player profile.
- Achievements.

### V3
- Supabase Edge Functions.
- Server-side score validation.
- Anti-cheat.
- Global leaderboard.

## Privacy

Chỉ lưu nickname và dữ liệu game tối thiểu.

Không thu thập:
- email.
- password.
- địa chỉ.
- số điện thoại.
