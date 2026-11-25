# FarBase Rush — Farcaster Mini App Arcade

Game platformer vượt cạm bẫy (**Trap Arcade**) trên hệ sinh thái Farcaster & Base, hỗ trợ **4 ngôn ngữ** (`Tiếng Việt`, `English`, `Español`, `日本語`), thử thách bản đồ chung hàng ngày (**Daily Seeded Challenge**) và bảng xếp hạng server xác thực FID qua **Quick Auth + Upstash Redis**.

---

## Tính năng chính

1. **Chuẩn Farcaster Mini App (Frame v2 + fallback v1):**
   - Manifest `/.well-known/farcaster.json`, dynamic OpenGraph & vector splash/icon (`/opengraph-image`, `/icon.png`, `/splash.png`).
   - Tự động nhận diện người dùng Farcaster (`sdk.context`), tắt splash (`sdk.actions.ready()`), nút ghim ứng dụng (`sdk.actions.addFrame`) và chia sẻ kết quả trực tiếp lên Warpcast (`sdk.actions.composeCast`).

2. **FarBase Rush (HiDPI Neon-Cyber Trap Arcade):**
   - 3 màn chiến dịch (*Genesis Block*, *Gas Wars*, *Bear Market*) + **Daily Challenge** sinh tự động mỗi ngày UTC (mọi người chơi cùng 1 map).
   - Đồ họa Canvas Retina HiDPI, nền parallax đa lớp, hiệu ứng rung màn hình (tôn trọng `prefers-reduced-motion`), điều khiển bàn phím & cụm nút cảm ứng chuẩn kích thước mobile (`>= 56px`).

3. **Giao diện Đa ngôn ngữ (`vi` / `en` / `es` / `ja`):**
   - Tự động phát hiện theo ngôn ngữ trình duyệt, lưu tùy chọn và chuyển tức thì ngay trên thanh đầu trang (bao gồm cả chữ nổi trong Canvas và nội dung Share Cast).

4. **Bảng xếp hạng Daily Challenge (Upstash Redis):**
   - Xác thực FID bằng `@farcaster/quick-auth`, kiểmop trần điểm `maxScore(dailyLevel(day))`, ân hạn 10 phút sau nửa đêm UTC.

---

## Chạy & Kiểm thử

```bash
npm install
npm run dev
npm test
```

## Cấu hình biến môi trường trên Vercel

- `NEXT_PUBLIC_HOST`: domain của Mini App (ví dụ `farcaster-frame.vercel.app`).
- `FARCASTER_HEADER`, `FARCASTER_PAYLOAD`, `FARCASTER_SIGNATURE`: chữ ký liên kết domain từ Warpcast Developer Portal.
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` (hoặc `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`): kết nối Upstash Redis từ Vercel Storage Marketplace để bật `/api/leaderboard`.
