# UI / UX PROMPT

Thiết kế game theo phong cách **kids-friendly arcade racing**.

## Màu sắc

Ưu tiên:
- Nền sáng.
- Xanh dương.
- Vàng.
- Cam.
- Xanh lá.
- Trắng.

Không dùng giao diện quá tối.

## Font

Dùng font sans-serif tròn, dễ đọc.

Nếu dùng Google Fonts CDN, chọn font thân thiện với trẻ em.

Nếu không có Internet, fallback về:

```css
font-family: Arial, sans-serif;
```

## Start Screen

Bố cục:

```text
       🏎️
   BÉ ĐUA XE

Né chướng ngại vật
Thu thập thật nhiều xu!

┌─────────────────┐
│  BẮT ĐẦU CHƠI   │
└─────────────────┘

← → hoặc A D
```

Nút Start phải lớn và dễ bấm.

## HUD

Ở phía trên:

```text
⭐ SCORE       🪙 COIN       🏆 BEST
  1250           12           5400

             LEVEL 3
```

Có nút:

```text
⏸
```

## Game Area

Đường đua nằm chính giữa.

Desktop:

```text
┌─────────────────────────────┐
│ SCORE          COIN    PAUSE│
├─────────────────────────────┤
│                             │
│          🚗                 │
│                             │
│      🪙                     │
│                🚧           │
│                             │
│          🏎️                │
│                             │
└─────────────────────────────┘
```

Mobile phải tự co giãn.

## Mobile Controls

Cuối game:

```text
┌──────────┐       ┌──────────┐
│    ◀     │       │    ▶     │
│ LEFT     │       │ RIGHT    │
└──────────┘       └──────────┘
```

Touch target tối thiểu khoảng 44px.

## Pause Overlay

```text
       ⏸ GAME PAUSED

       [ TIẾP TỤC ]

       [ CHƠI LẠI ]
```

## Game Over Overlay

```text
       💥 ÔI KHÔNG!

       GAME OVER

       Điểm: 1250
       Kỷ lục: 2200

       [ CHƠI LẠI ]

       [ TRANG CHỦ ]
```

## Animation

Dùng animation nhẹ:
- Road scrolling.
- Coin spinning.
- Button press.
- Score update.
- Explosion/impact nhẹ.

Không sử dụng animation gây chóng mặt.

Tôn trọng:

```css
@media (prefers-reduced-motion: reduce)
```

## UX

Game phải hiểu được mà không cần đọc hướng dẫn dài.

Trẻ phải có thể:
1. Nhấn Start.
2. Nhìn thấy xe.
3. Hiểu phải né.
4. Chơi ngay.
