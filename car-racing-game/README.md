# 🏎️ Bé Đua Xe — Né Chướng Ngại Vật (V2)

Mini game HTML5 cho bé 4–10 tuổi. Chỉ dùng HTML + CSS + JavaScript thuần, vẽ bằng Canvas — **không cần cài đặt, không cần file hình/âm thanh**.

## Chạy game

Mở file `index.html` bằng Chrome, Edge hoặc Firefox là chơi được ngay (chế độ offline).

> Bảng thành tích online cần tải thư viện Supabase từ CDN. Nếu mở bằng `file://` bị hạn chế, hãy chạy bằng Live Server (VS Code) hoặc một static server bất kỳ.

## Điều khiển

| Thiết bị | Cách chơi |
|---|---|
| Máy tính | `←` `→` hoặc `A` `D` đổi làn · `Space` bật Turbo · `Esc` / `P` tạm dừng |
| Máy tính (tốc độ) | `↑` / `W` tăng tốc · `↓` / `S` giảm tốc (5 số tốc độ, chạy nhanh được nhiều điểm hơn) |
| Máy tính (tên lửa) | `F` phóng tên lửa 🚀 — bay thẳng lên theo làn của xe, phá vật cản đầu tiên. Có sẵn 2 quả; bắn xong thì **cứ 2 giây tự nạp lại 1 quả** (có thanh nạp ở nút 🚀). Nhặt biểu tượng 🚀 trên đường để được thêm 3 quả (tối đa 5). Hộp quà 🎁 trên đường cho phần thưởng bất ngờ: điểm, Turbo, tên lửa hoặc xu |
| Điện thoại / tablet | Nút **TRÁI / − / TURBO / 🚀 / + / PHẢI** bên dưới, hoặc vuốt trái/phải trên màn hình |

## Tính năng

- **3 làn đường**, **10 level** (cấu hình tập trung trong mảng `LEVELS` ở `script.js`). Level 10 là đường hoàng hôn đặc biệt, điểm thưởng ×1.5.
- **Vật cản**: xe nhiều màu, xe tải, cọc giao thông, rào chắn, vũng nước. Game luôn chừa ít nhất một làn an toàn mà bé với tới được.
- **Power-up**: 🛡️ Khiên (đỡ 1 lần va chạm) · 🧲 Nam châm (7s) · 🐌 Chậm lại (5s) · ×2 Xu gấp đôi (9s).
- **Turbo** ⚡: thanh Turbo đầy nhờ nhặt xu (+5), né sát (+8), mốc combo (+10). Bật Turbo trong 4 giây: chạy nhanh, hút xu, điểm ×2, được bảo vệ 1.5 giây đầu.
- **Combo**: né vật cản và nhặt xu liên tiếp để tăng hệ số điểm (tối đa ×3).
- **Chọn xe**: 6 xe (Sét Xanh, Ngựa Vằn Đỏ, Ong Vàng, Kẹo Hồng, Cá Mập Xanh, Cảnh Sát) ở nút 🚗 CHỌN XE ngoài màn hình chính. Chỉ khác hình dáng và màu sắc, không khác sức mạnh. Xe đã chọn được nhớ cho lần chơi sau. Thêm xe mới bằng cách thêm một dòng vào mảng `CARS` trong `script.js`.
- **Gắn ảnh của bé lên xe**: trong màn 🚗 CHỌN XE bấm 📷 GẮN ẢNH CỦA BÉ. Ảnh được cắt tròn, thu nhỏ còn 128px và hiện ở chỗ tay lái (xe đua) hoặc trên nóc (xe thể thao). Ảnh **chỉ lưu trong trình duyệt trên máy này** (localStorage), không gửi lên Supabase hay bất kỳ đâu; bấm 🗑️ để bỏ ảnh.
- **🏁 GIẢI ĐẤU**: 4 chặng (Đường Làng, Ven Biển, Núi Xanh, Siêu Tốc) đua với 3 bạn Bé Bin 🐻, Bé Na 🦊, Bé Mi 🐯. Mỗi chặng có đếm ngược 3-2-1, vạch đích caro và thanh đường đua bên phải cho thấy ai đang dẫn đầu. Về hạng 1/2/3/4 được 10/7/5/3 điểm; cộng điểm 4 chặng để xem ai vô địch và nhận cúp 🏆 (số cúp được lưu trên máy). Trong giải đấu, **va chạm không bị Game Over**, xe chỉ quay vòng và chạy chậm khoảng 1,3 giây nên bạn đối thủ có thể vượt lên. Chạy số nhanh, dùng Turbo và nhặt power-up để về đích sớm. Điểm giải đấu không tính vào bảng thành tích online.
- **Điểm cao** và **bảng thành tích** lưu bằng `localStorage`.
- **Âm thanh** tổng hợp bằng WebAudio, có nút bật/tắt.
- Tự động tạm dừng khi chuyển tab; tôn trọng `prefers-reduced-motion`.

## Chạy như một trang web / ứng dụng (PWA)

Game là site tĩnh nên chạy được trên mọi dịch vụ hosting tĩnh (Render, GitHub Pages, Netlify, Cloudflare Pages…). Các file phục vụ web:

| File | Việc nó làm |
|---|---|
| `manifest.webmanifest` + `icons/` | cho phép "Thêm vào màn hình chính" trên điện thoại / "Cài đặt" trên Chrome, Edge |
| `sw.js` | service worker: chơi được cả khi mất mạng (mạng trước, cache dự phòng). Khi sửa code, tăng `CACHE_VERSION` trong file này |
| `favicon.svg`, `icons/*.png` | biểu tượng tab trình duyệt, màn hình chính, iOS |
| `404.html` | trang báo lỗi thân thiện khi gõ sai đường dẫn |
| `robots.txt` | cho công cụ tìm kiếm lập chỉ mục trang |
| `render.yaml` | cấu hình triển khai lên Render |

Service worker chỉ hoạt động trên **https** hoặc `localhost` (Render cấp https sẵn). Mở bằng `file://` game vẫn chơi được nhưng không có chế độ cài đặt/offline.

### Chạy bằng Node (Render Web Service)

Nếu muốn triển khai dạng **Web Service** thay vì Static Site, repo đã có `package.json` và `server.js` (server tĩnh tối giản, không cần cài thư viện). Trên Render điền: **Build Command** `yarn` (hoặc để trống), **Start Command** `yarn start`. Chạy thử trên máy có Node.js: `node server.js` rồi mở `http://localhost:3000`.

## Đưa lên GitHub và Render

Repo đã có sẵn `.gitignore`, `.gitattributes` và `render.yaml`.

**1. Đưa lên GitHub** (cài [Git](https://git-scm.com/download/win) trước), chạy trong thư mục `car-racing-game`:

```bash
git init -b main
git add .
git commit -m "Be Dua Xe - game dua xe cho be"
git remote add origin https://github.com/<ten-ban>/be-dua-xe.git
git push -u origin main
```

(Tạo repo trống `be-dua-xe` trên github.com trước, không tick "Add README". Nếu không muốn dùng lệnh, có thể dùng GitHub Desktop hoặc kéo-thả file lên trang repo.)

**2. Triển khai trên Render** (miễn phí cho Static Site):

1. Vào [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint** → chọn repo vừa tạo. Render đọc `render.yaml` và tự tạo Static Site `be-dua-xe`.
   (Hoặc **New → Static Site**, Build Command để trống, **Publish Directory** điền `.`)
2. Bấm **Deploy**, vài chục giây sau có link dạng `https://be-dua-xe.onrender.com`.
3. Mỗi lần `git push`, Render tự cập nhật bản mới.

**Supabase trên bản đã deploy:** điền Project URL và anon key vào `config.js` rồi push. Anon key được thiết kế để công khai (an toàn nhờ RLS trong `supabase-schema.sql`); **không** đưa `service_role` key lên repo. Nhớ thêm địa chỉ Render vào danh sách cho phép trong Supabase nếu bạn bật giới hạn domain.

## Bật bảng thành tích online (Supabase) — tuỳ chọn

1. Tạo project trên [supabase.com](https://supabase.com).
2. Vào **SQL Editor**, chạy toàn bộ file `supabase-schema.sql`.
3. Vào **Project Settings → API**, lấy **Project URL** và **anon / public key**.
4. Điền vào `config.js`:

```javascript
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJ...";
```

⚠️ **Không bao giờ** dùng `service_role` key ở frontend (game sẽ tự từ chối key này).

Nếu chưa cấu hình hoặc mạng lỗi, game vẫn chơi bình thường: điểm được lưu trên máy và hiển thị bảng thành tích local (tối đa 20 bản ghi, hiện Top 10).

### Lưu ý bảo mật

Policy `MVP anonymous insert` trong `supabase-schema.sql` cho phép gửi điểm ẩn danh (có kiểm tra giới hạn giá trị) — **chỉ phù hợp cho MVP**. Frontend không thể chống gian lận hoàn toàn. Khi bảng có giá trị thi đấu thật, hãy dùng Supabase Edge Function để kiểm tra điểm phía server, giới hạn tần suất và đăng nhập ẩn danh.

## Quyền riêng tư

Chỉ lưu `nickname`, `score`, `level`, `coins`, `created_at`. Không thu thập email, mật khẩu, địa chỉ hay số điện thoại. Tên chỉ cho phép chữ, số, khoảng trắng và `_ - .` (2–15 ký tự). Game không có quảng cáo hay liên kết ngoài.

## Cấu trúc file

```text
car-racing-game/
├── index.html           Giao diện + các màn hình (start, pause, game over, bảng điểm...)
├── styles.css           Phong cách hoạt hình, responsive
├── script.js            Toàn bộ logic game (chia khối rõ ràng, có comment)
├── config.js            Cấu hình Supabase (tuỳ chọn)
├── supabase-schema.sql  Bảng + RLS cho leaderboard
└── README.md
```

## Chỉnh game dễ dàng

- Tốc độ / độ khó từng level: mảng `LEVELS` trong `script.js`.
- Thời gian power-up: đối tượng `POWERUPS`; thông số Turbo: `TURBO`.
- Màu xe vật cản: `OBSTACLE_COLORS`.
