# ANTIGRAVITY MASTER INSTRUCTION

Đọc toàn bộ các file `.md` trong project trước khi bắt đầu code.

Thứ tự:

1. `01_MASTER_PROMPT_V2.md`
2. `02_LEVEL_SYSTEM.md`
3. `03_POWERUP_TURBO.md`
4. `04_SUPABASE_SCHEMA.md`
5. `05_SUPABASE_INTEGRATION.md`
6. `06_LEADERBOARD_UI.md`

## Quy trình

### Phase 1 — Analyze
Kiểm tra project hiện tại.

Nếu project cũ đã có game:
- Không xóa gameplay đang hoạt động.
- Refactor trước khi mở rộng.

### Phase 2 — Build Core
Hoàn thiện:
- Level.
- Power-up.
- Turbo.
- Combo.

### Phase 3 — Supabase
Tạo:
- `config.js`
- `supabase-schema.sql`
- integration layer.

Không để Supabase làm game crash khi chưa cấu hình.

### Phase 4 — Leaderboard
Tạo:
- Online leaderboard.
- Local fallback.
- Submit score.
- Top 10.

### Phase 5 — QA
Test:

```text
[ ] Start
[ ] Movement
[ ] Collision
[ ] Coin
[ ] Level 1
[ ] Level 2
[ ] Level 3
[ ] Level 4–10
[ ] Shield
[ ] Magnet
[ ] Slow Motion
[ ] Double Coin
[ ] Turbo
[ ] Combo
[ ] Pause
[ ] Restart
[ ] Game Over
[ ] Local high score
[ ] Local leaderboard
[ ] Supabase connection
[ ] Submit score
[ ] Fetch leaderboard
[ ] Supabase error fallback
[ ] Mobile controls
[ ] Responsive
```

## Quy tắc quan trọng

1. Không sử dụng framework.
2. Không đưa secret key vào frontend.
3. Không để lỗi mạng làm game crash.
4. Không xóa tính năng đang chạy nếu không cần.
5. Không tạo tính năng chưa hoàn thiện.
6. Sau mỗi thay đổi lớn, kiểm tra Console.
7. Giữ code dễ đọc.
8. Comment những phần logic game khó hiểu.
9. Ưu tiên UX cho trẻ em.
10. Game phải chơi được trước khi tối ưu hóa tính năng phụ.
