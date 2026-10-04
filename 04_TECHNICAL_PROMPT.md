# TECHNICAL IMPLEMENTATION PROMPT

## Architecture

Tổ chức JavaScript theo các module logic:

```text
Game
Player
Obstacle
Coin
Input
Collision
UI
Storage
Audio
```

Không nhất thiết phải tách thành nhiều file JS ở phiên bản đầu, nhưng code phải được chia thành các class/function rõ ràng.

## Game Loop

Sử dụng:

```javascript
requestAnimationFrame(gameLoop)
```

Game loop thực hiện:

```text
calculate delta time
↓
update player
↓
spawn obstacles
↓
update obstacles
↓
update coins
↓
collision detection
↓
update score
↓
update level
↓
render
```

## Player

Player cần có:

```javascript
{
    lane,
    x,
    y,
    width,
    height,
    targetX,
    speed
}
```

Khi nhấn trái/phải:
- Thay đổi lane.
- Tính targetX.
- Di chuyển mượt đến targetX.

## Obstacle

Mỗi obstacle:

```javascript
{
    x,
    y,
    width,
    height,
    speed,
    type,
    lane
}
```

## Coin

Mỗi coin:

```javascript
{
    x,
    y,
    radius,
    speed,
    lane
}
```

## Spawn System

Dùng thời gian để spawn.

Không tạo quá nhiều object.

Ví dụ:

```javascript
spawnTimer += deltaTime;

if (spawnTimer >= spawnInterval) {
    spawnObstacle();
    spawnTimer = 0;
}
```

Spawn interval giảm dần theo level nhưng có giới hạn.

## Collision Detection

Rectangle:

```javascript
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
```

Coin collision có thể dùng khoảng cách tâm.

## Cleanup

Object ra khỏi màn hình phải được xóa:

```javascript
obstacles = obstacles.filter(...)
coins = coins.filter(...)
```

## LocalStorage

Key:

```text
kidsRacingHighScore
kidsRacingSound
```

Validate dữ liệu khi đọc.

Không để giá trị NaN hoặc Infinity ảnh hưởng game.

## Keyboard

Hỗ trợ:

```text
ArrowLeft
ArrowRight
a
d
A
D
Space
Escape
```

Space có thể Pause/Resume.

Không chặn keyboard khi focus đang ở input/button nếu không cần.

## Touch

Dùng Pointer Events.

Hỗ trợ:
- Pointer down.
- Pointer up.
- Không phụ thuộc hover.

## Responsive

Game area dùng:

```css
width: min(92vw, 480px);
```

Không để page xuất hiện horizontal scroll trên mobile.

## Performance

- Dùng requestAnimationFrame.
- Hạn chế tạo DOM element liên tục.
- Có thể dùng CSS transforms cho object.
- Không tạo hàng trăm object.
- Cleanup animation/timer khi restart hoặc game over.

## Rendering

Có thể dùng một trong hai hướng:

### Option A — DOM/CSS

Phù hợp cho người mới.

### Option B — Canvas

Khuyến nghị nếu muốn game mượt hơn.

Nếu dùng Canvas:
- Một canvas duy nhất.
- Resize theo container.
- Scale theo devicePixelRatio.
- Không dùng canvas quá lớn.

## Error Handling

Nếu asset hoặc sound không tải được:
- Game vẫn phải chạy.
- Dùng CSS/SVG fallback.
- Không để lỗi asset làm game crash.

## Acceptance Test

Kiểm tra:

- Start.
- Left/right.
- A/D.
- Mobile buttons.
- Collision.
- Coin.
- Score.
- Level.
- Pause.
- Resume.
- Restart.
- Game Over.
- High Score.
- Sound toggle.
- Responsive.
- Refresh browser.

Không được có lỗi nghiêm trọng trong Console.
