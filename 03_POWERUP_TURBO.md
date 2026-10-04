# POWER-UP & TURBO

## Power-up Object

```javascript
{
  type: "shield",
  x: 0,
  y: 0,
  duration: 6000,
  active: true
}
```

## Shield

Khi nhặt:
```text
🛡️ SHIELD!
```

Va chạm:
- Không Game Over.
- Shield bị phá.
- Hiệu ứng ngắn.

## Magnet

Trong thời gian hiệu lực:
- Tính khoảng cách tới coin.
- Nếu coin trong radius → di chuyển về player.

Không hút coin ngoài màn hình.

## Slow Motion

Trong thời gian hiệu lực:

```javascript
effectiveObstacleSpeed = obstacleSpeed * 0.55;
```

## Double Coin

```javascript
coinValue = baseCoinValue * 2;
```

## Power-up Stack

Không cho hiệu ứng xung đột.

Ví dụ:
- Nhặt Slow Motion khi đang Slow Motion → reset duration hoặc cộng thêm thời gian.
- Không tạo vô hạn duration.

## Turbo Meter

State:

```javascript
{
  value: 0,
  max: 100,
  active: false,
  remaining: 0
}
```

Tăng meter:
- Coin: +5.
- Near miss: +8.
- Combo milestone: +10.

## Turbo Activation

Desktop:
```text
SPACE
```

Mobile:
```text
⚡ TURBO
```

Turbo chỉ kích hoạt khi meter >= 100.

Khi kích hoạt:
- meter về 0.
- active = true.
- duration 4000ms.

## Turbo Effects

- Player visual effect.
- Road speed tăng.
- Coin multiplier.
- Có thể miễn nhiễm obstacle trong 1–2 giây đầu nếu muốn gameplay thân thiện.

## UX

Hiển thị rõ:
```text
TURBO READY!
```

khi meter đầy.
