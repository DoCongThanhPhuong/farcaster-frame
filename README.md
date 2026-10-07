# Farcaster Frame v2 (Mini App) - Builder Airdrop & Rewards 🪂

Dự án Farcaster Frame v2 (Mini App) hoàn chỉnh chuẩn Warpcast & Base L2, tối ưu cho builder săn airdrop từ hệ sinh thái Farcaster (Warpcast Builder Rounds, Base Grants, Moxie, Degen).

---

## ⚡ Tính Năng Săn Airdrop & Tăng Tương Tác

1. **Chuẩn Frame v2 (Mini App) & Tương thích v1:**
   - Manifest chuẩn `/.well-known/farcaster.json` kèm `accountAssociation` và `frame`.
   - Dynamic meta tags `fc:frame` (action `launch_frame`), OpenGraph, fallback v1 endpoint (`/api/frame`).
   - Tự động sinh ảnh động SVG/PNG (`/opengraph-image`, `/icon.png`, `/splash.png`, `/image`).

2. **Tích hợp @farcaster/frame-sdk & Farcaster In-app Wallet:**
   - Nhận diện người dùng (FID, username, display name, avatar).
   - Tự động gọi `sdk.actions.ready()` tắt màn hình chờ (splash).
   - Nút "Pin App" ghim ứng dụng vào dock Warpcast của user.

3. **Tính Điểm & Điều Kiện Airdrop (Airdrop Eligibility Score):**
   - Phân hạng theo độ tuổi tài khoản (Seniority theo FID: OG Legend, Pro Builder, Early Adopter).
   - Tính hệ số Multiplier theo streak check-in và trạng thái kết nối ví.

4. **Vòng Lặp Giữ Chân Người Dùng (Daily Check-in Streak):**
   - Check-in nhận điểm mỗi 24h (1 - 7 ngày streak).
   - Tăng chỉ số DAU (Daily Active Users) của Frame — tiêu chí hàng đầu để nhận Farcaster & Moxie Builder Grants.

5. **Tương Tác Onchain Trên Mạng Base (Wagmi + Viem):**
   - Free Mint "Builder Pass" trực tiếp trên Base / Base Sepolia.
   - Hỗ trợ Gasless Signature (ký thông điệp xác thực không tốn gas).
   - Tăng transaction count onchain cho dự án.

6. **Viral Loop (Tự Động Share Cast):**
   - Gọi `sdk.actions.composeCast` mở trực tiếp trình soạn thảo Warpcast kèm link Frame.
   - User chia sẻ streak giúp kéo thêm người dùng tự nhiên vào Frame của bạn.

---

## 🚀 Hướng Dẫn Chạy & Deploy

### 1. Cài đặt & Chạy Local
```bash
npm install
npm run dev
```
Mở trình duyệt: `http://localhost:3000` (hỗ trợ cả chế độ Web Preview và kết nối ví MetaMask/Coinbase/Farcaster).

### 2. Kiểm Tra Test Suite
```bash
npm test
```

### 3. Deploy Lên Vercel
1. Push mã nguồn lên GitHub:
   ```bash
   git add .
   git commit -m "feat: farcaster frame v2 mini app for builder airdrop"
   git push origin main
   ```
2. Truy cập [Vercel](https://vercel.com), import repository `farcaster-frame`.
3. Vercel tự động nhận diện framework **Next.js** và deploy HTTPS.

### 4. Xác Thực Domain Trên Warpcast Developer Portal
1. Truy cập [Warpcast Frame Developer Portal](https://warpcast.com/~/developers/frames).
2. Nhập URL domain Vercel của bạn (ví dụ: `https://your-project.vercel.app`).
3. Dùng tài khoản Warpcast của bạn để ký thông điệp liên kết domain (Account Association).
4. Sao chép các trường `header`, `payload`, `signature` vào biến môi trường trên Vercel:
   - `FARCASTER_HEADER`
   - `FARCASTER_PAYLOAD`
   - `FARCASTER_SIGNATURE`
   - `NEXT_PUBLIC_HOST` (ví dụ: `your-project.vercel.app`)
5. Redeploy lại Vercel để áp dụng chữ ký.

### 5. Cast Lên Warpcast Để Bắt Đầu Tính Điểm Builder
- Đăng cast chứa link Frame vào các channel: `/base`, `/farcaster`, `/dev`, `/frames`.
- Khi user bấm nút trên feed, Mini App sẽ mở ra với đầy đủ tính năng claim và mint.
