# GAMEPLAY SPECIFICATION

## Tên game

**Bé Đua Xe — Né Chướng Ngại Vật**

## Đối tượng

Trẻ em khoảng 4–10 tuổi.

## Core Gameplay

Người chơi điều khiển xe trên một đường đua dọc.

Xe của người chơi nằm ở phần dưới màn hình.

Chướng ngại vật xuất hiện từ phía trên và di chuyển xuống.

Người chơi phải di chuyển xe sang trái/phải để tránh va chạm.

## Làn đường

Mặc định 3 làn:

```text
| LANE 1 | LANE 2 | LANE 3 |
```

Xe có thể di chuyển giữa 3 làn.

Ưu tiên điều khiển đơn giản.

## Player

Xe người chơi:
- Nằm gần cuối màn hình.
- Không được đi ra ngoài đường.
- Chuyển làn mượt.
- Có hiệu ứng nhẹ khi di chuyển.

## Obstacles

Các loại:
1. Xe màu khác.
2. Cone giao thông.
3. Hộp chắn đường.
4. Vũng nước hoặc vật cản vui nhộn.

Không dùng vật cản có tính chất bạo lực.

## Coins

Coin xuất hiện ngẫu nhiên.

Khi thu thập:
- +10 điểm.
- Có hiệu ứng biến mất.
- Có âm thanh nếu âm thanh được bật.

## Score

Điểm tăng theo thời gian.

Ví dụ:

```text
Score = thời gian sống sót × hệ số level
```

Không cần công thức quá phức tạp.

## Level

Level 1:
- Chậm.
- Ít vật cản.

Level 2:
- Nhanh hơn.

Level 3:
- Nhiều vật cản hơn.

Level 4+:
- Tăng tốc từ từ.

Hiển thị:

```text
LEVEL 3
```

## Difficulty Curve

Không tăng tốc đột ngột.

Tốc độ có thể tăng khoảng 5–10% sau mỗi mốc điểm/thời gian.

Giới hạn tốc độ tối đa để game vẫn phù hợp với trẻ em.

## Collision

Dùng rectangle collision đơn giản.

Pseudo:

```text
if player intersects obstacle:
    gameOver()
```

Có thể thêm khoảng đệm nhỏ để collision không quá khó.

## Game States

Game có các state:

```text
START
PLAYING
PAUSED
GAME_OVER
```

Không để các state chạy đồng thời.

## Pause

Khi pause:
- Dừng game loop.
- Dừng sinh obstacle.
- Dừng cập nhật score.
- Hiển thị Pause Overlay.

Nút:

```text
▶ TIẾP TỤC
```

## Restart

Khi Restart:
- Xóa obstacles.
- Xóa coins.
- Reset score.
- Reset level.
- Reset tốc độ.
- Đưa player về lane giữa.
- Bắt đầu game mới.

## Game Over

Game Over phải:
- Dừng gameplay.
- Dừng spawn.
- Lưu High Score nếu cần.
- Hiển thị kết quả.
- Có nút chơi lại.

## Anti-frustration

Không spawn obstacle ngay sát player.

Không spawn hai obstacle che kín toàn bộ 3 lane cùng lúc.

Luôn để người chơi có ít nhất một lựa chọn an toàn trong phần lớn tình huống.
