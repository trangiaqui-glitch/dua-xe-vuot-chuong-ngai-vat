# LEVEL SYSTEM

## Level Data

Tạo cấu hình tập trung:

```javascript
const LEVELS = [
  {
    id: 1,
    targetScore: 500,
    speed: 180,
    spawnInterval: 1200
  },
  ...
];
```

Không hard-code logic level ở nhiều nơi.

## Level Up

Khi đạt target:

```text
🎉 LEVEL UP!

LEVEL 4

Sẵn sàng chưa?
[ TIẾP TỤC ]
```

Trong khi chuyển level:
- Pause gameplay.
- Hiển thị overlay.
- Tăng difficulty.
- Resume sau khi người chơi nhấn Continue.

## Difficulty

Mỗi level có:
- roadSpeed.
- obstacleSpeed.
- spawnInterval.
- coinChance.
- powerupChance.
- obstaclePattern.

Giới hạn tốc độ để tránh game quá khó.

## Level 10

Level cuối có thể có:
- Background đặc biệt.
- tốc độ cao hơn.
- obstacle pattern đặc biệt.
- bonus score.

Không bắt buộc boss nếu làm MVP.
