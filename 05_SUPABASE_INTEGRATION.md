# SUPABASE INTEGRATION

## config.js

Tạo:

```javascript
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

Không hard-code service role key.

## Initialize

Dùng Supabase JS client.

Có thể dùng CDN/ESM.

Nếu config chưa được thay:
- `supabaseClient = null`.
- Chuyển sang offline mode.

## Functions

Tạo các function:

```javascript
isOnlineMode()
getLeaderboard()
submitScore(result)
```

## getLeaderboard()

Flow:

```text
check config
↓
query Supabase
↓
validate response
↓
return top 10
```

Nếu lỗi:
```text
fallback to local leaderboard
```

## submitScore()

Flow:

```text
Game Over
↓
Player nhập nickname
↓
Validate nickname
↓
Validate score
↓
Submit Supabase
↓
Refresh leaderboard
```

Nếu submit thất bại:
- Không mất điểm.
- Lưu score local.
- Hiển thị:
  `Không thể kết nối bảng thành tích. Điểm đã được lưu trên máy.`

## Local leaderboard

Dùng:

```text
kidsRacingLeaderboard
```

Lưu tối đa 20 record.

Sort:
```javascript
score descending
```

Chỉ hiển thị Top 10.

## Network resilience

Không được làm game phụ thuộc mạng.

Game:
- Start offline.
- Play offline.
- Game Over offline.
- Leaderboard offline.

Supabase chỉ là lớp bổ sung.

## Security note

Frontend không thể tự bảo vệ hoàn toàn điểm số.

Nếu leaderboard có giá trị cạnh tranh thực sự:
- Dùng Edge Function.
- Server-side score validation.
- Rate limiting.
- Có thể thêm anonymous auth.
