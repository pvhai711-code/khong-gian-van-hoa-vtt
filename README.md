# KHÔNG GIAN VĂN HÓA HỒ CHÍ MINH — Trường THPT Võ Trường Toản

Website chính thức (bản thật, có server) của Không gian văn hóa Hồ Chí Minh —
Trường THPT Võ Trường Toản. Giao diện theo đúng bản thiết kế đã duyệt
(`preview-trang-chinh-V3.html`, V3.17); dữ liệu (bài viết, ảnh, tài khoản)
nằm trên **Supabase**; website chạy trên **Vercel**; có khu vực **Admin** để
đăng nhập, chỉnh sửa hình ảnh/chữ và đăng bài.

- Công nghệ: **Next.js 14** (App Router, JavaScript) + **Supabase**
  (PostgreSQL + Auth + Storage) + CSS thuần (không dùng framework giao diện).
- Phân quyền 3 cấp: **Admin chính** (toàn quyền) / **Biên tập viên** (đăng
  bài trực tiếp) / **Cộng tác viên** (gửi bài chờ duyệt). Người dùng tự đăng
  ký tài khoản ở trang `/dang-ky`, Admin duyệt ở mục *Yêu cầu đăng ký* mới
  đăng nhập/đăng bài được.

---

## 1. Cấu trúc thư mục

```
website/
├─ package.json            # thông tin gói + lệnh chạy
├─ next.config.js
├─ .env.example            # mẫu khai báo biến môi trường (xem mục 3)
├─ seed-posts.sql          # 13 bài viết mẫu — chạy trong Supabase SQL Editor
├─ public/
│  ├─ logo.png             # logo trường (header + footer)
│  ├─ chan-dung-bac.png    # ảnh chân dung Bác (xem lưu ý mục 7)
│  └─ trong-dong.jpg       # họa tiết trống đồng mờ ở thẻ chân dung
└─ src/
   ├─ middleware.js        # làm mới phiên đăng nhập, chặn /admin khi chưa đăng nhập
   ├─ lib/
   │  ├─ supabase/         # client trình duyệt / server / khóa bí mật / middleware
   │  ├─ data.js           # hàm đọc dữ liệu cho trang công khai
   │  ├─ utils.js          # định dạng giờ, tạo slug, nhãn vai trò...
   │  └─ audit.js          # ghi nhật ký thao tác (bảng audit_logs)
   ├─ components/          # Header, Footer, menu, khối bài viết, khu Admin...
   └─ app/
      ├─ page.js           # Trang chủ
      ├─ tin-tuc/          # Trang Tin tức - Sự kiện (+ tìm kiếm ?q=)
      ├─ bai-viet/[slug]/  # Trang chi tiết bài viết
      ├─ cuoc-doi/         # Trang Cuộc đời, sự nghiệp (timeline)
      ├─ chuyen-muc/[slug]/# Trang danh sách theo chuyên mục
      ├─ dang-nhap/        # Đăng nhập Admin
      ├─ dang-ky/          # Đăng ký tài khoản (chờ Admin duyệt)
      ├─ admin/            # Khu vực Admin (Tổng quan, Đăng bài, Quản lý bài,
      │                    # Media, Chuyên mục, Mốc thời gian, Tài khoản,
      │                    # Yêu cầu đăng ký, Cài đặt trang)
      └─ api/
         ├─ bai-viet/view/ # Tăng lượt xem bài viết (qua server)
         └─ admin/users/   # Tạo/xóa tài khoản (dùng khóa bí mật, chỉ Admin)
```

Cơ sở dữ liệu gồm 8 bảng: `profiles, account_requests, categories, posts,
media, timeline_events, site_settings, audit_logs` và 2 kho chứa file
`images`, `videos` — đã được tạo từ file `supabase-schema.sql` (thư mục cha).

## 2. Chạy thử trên máy cá nhân (không bắt buộc)

Cần cài sẵn Node.js 18+ (khuyên dùng bản LTS mới nhất).

```bash
# 1) Cài thư viện (chỉ lần đầu)
npm install

# 2) Tạo file .env.local từ mẫu rồi điền thông tin Supabase của trường
cp .env.example .env.local

# 3) Chạy bản xem thử
npm run dev
# Mở http://localhost:3000
```

## 3. Biến môi trường (rất quan trọng)

| Biến | Lấy ở đâu | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Công khai |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API Keys → **Publishable key** (`sb_publishable_...`) | Công khai |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → **Secret key** (`sb_secret_...`) | **TUYỆT ĐỐI BÍ MẬT** — chỉ khai trên Vercel, không đưa vào GitHub, không gửi qua chat |

Thiếu khóa bí mật thì website vẫn chạy, nhưng 2 tính năng sau không hoạt
động: **tạo/xóa tài khoản trong Admin** và **đếm lượt xem bài viết**
(trang Admin sẽ hiện thông báo nhắc bổ sung khóa này).

## 4. Đưa mã nguồn lên GitHub của thầy

1. Đăng nhập **github.com** → nút **+** (góc phải trên) → **New repository**.
2. Đặt tên kho, ví dụ: `khong-gian-van-hoa-hcm` → chọn **Public** →
   **Create repository**.
3. Ở trang kho vừa tạo, bấm **uploading an existing file** → kéo thả
   **toàn bộ thư mục `website`** (sau khi giải nén `website-source.zip`)
   vào → chờ tải xong → **Commit changes**.
   - Lưu ý: GitHub không tải lên thư mục rỗng và **không cần** (thậm chí
     không nên) tải `node_modules` — Vercel tự cài khi triển khai.
   - File `.env.local` chứa khóa: **không tải lên**. Các biến môi trường
     sẽ khai báo trực tiếp trong Vercel ở bước 5.

## 5. Triển khai lên Vercel

1. Đăng nhập **vercel.com** bằng tài khoản GitHub → **Add New → Project**.
2. Chọn kho `khong-gian-van-hoa-hcm` vừa tạo → **Import**.
   (Nếu Vercel hỏi *Root Directory* thì chọn thư mục chứa `package.json`.)
3. Mở mục **Environment Variables**, thêm đủ 3 biến ở mục 3 ở trên.
   Riêng `SUPABASE_SERVICE_ROLE_KEY`: mở Supabase → API Keys → bấm hiện
   **Secret key** → sao chép và **dán thẳng vào Vercel** (không qua chat,
   không qua trung gian).
4. Bấm **Deploy** → chờ 1–2 phút → nhận địa chỉ dạng
   `khong-gian-van-hoa-hcm.vercel.app`. Xong! Website đã công khai.
5. Sau này mỗi lần sửa mã và đẩy lên GitHub, Vercel **tự động đăng lại**
   bản mới. Sửa nội dung/chữ/ảnh thì dùng khu Admin, không cần đụng mã.

## 6. Tạo tài khoản Admin chính đầu tiên

1. Vào Supabase → **Authentication → Users → Add user → Create new user**:
   - Email: `pvhai711@gmail.com`
   - Password: **tự đặt mật khẩu Admin** (chỉ thầy biết, ghi lại cẩn thận)
   - Đánh dấu **Auto Confirm User** → **Create user**.
2. Gắn quyền Admin chính: mở lại file `supabase-schema.sql` (thư mục cha),
   ở **cuối file** có đoạn lệnh tạo Admin đang bị khóa bằng 2 dấu `--` →
   bỏ 2 dấu `--` ở đầu mỗi dòng của đoạn đó → dán vào **SQL Editor** →
   **Run**.
3. Mở website → **Đăng nhập Admin** (thanh đỏ nhỏ trên cùng) → đăng nhập
   bằng email + mật khẩu vừa đặt → vào được khu Admin là xong.
4. Từ đây Admin tự cấp thêm tài khoản cho giáo viên/học sinh ở mục
   **Quản lý tài khoản**, hoặc duyệt người tự đăng ký ở mục
   **Yêu cầu đăng ký** (khi duyệt, hệ thống tạo **mật khẩu tạm** hiện một
   lần — ghi lại để gửi riêng cho người được duyệt).

## 7. Nạp bài viết mẫu + lưu ý về ảnh chân dung

- Website mới đăng sẽ chưa có bài. Để có ngay nội dung như bản thiết kế:
  mở file **`seed-posts.sql`** (ở thư mục gốc của dự án này) → sao chép
  toàn bộ → dán vào Supabase **SQL Editor** → **Run**. Sẽ có 13 bài mẫu
  (Tin tức, Gương điển hình, Tư tưởng, Bác Hồ và thế giới). Admin sửa/xóa
  và đăng bài thật của trường bất cứ lúc nào; chạy lại file này không tạo
  trùng.
- **Ảnh chân dung Bác** (`public/chan-dung-bac.png`) hiện là ảnh **trích
  từ bản mẫu để giữ bố cục** — cần thay bằng **ảnh chân dung chính thống,
  chất lượng cao** khi có: cách dễ nhất là tải ảnh mới lên **Admin → Thư
  viện media**, sao chép link rồi dán vào **Admin → Cài đặt trang → Link
  ảnh chân dung** (không cần sửa mã nguồn).
- Logo trường là file `public/logo.png` — muốn đổi logo thì thay file này
  rồi triển khai lại.

## 8. Việc thường ngày trong Admin (tóm tắt)

| Việc | Vào mục |
|---|---|
| Đăng bài mới (có ảnh bìa, video) | Admin → **Đăng bài mới** |
| Sửa/xóa bài, duyệt bài chờ | Admin → **Quản lý bài viết** |
| Tải ảnh/video, lấy link ảnh | Admin → **Thư viện media** |
| Đổi tên/thứ tự chuyên mục trên menu | Admin → **Chuyên mục** |
| Sửa các mốc Cuộc đời, sự nghiệp | Admin → **Mốc thời gian** |
| Cấp/khóa/xóa tài khoản đăng bài | Admin → **Quản lý tài khoản** |
| Duyệt người tự đăng ký | Admin → **Yêu cầu đăng ký** |
| Sửa địa chỉ, điện thoại, banner, thống kê, ảnh chân dung | Admin → **Cài đặt trang** |

---
*Bộ hồ sơ dự án nằm ở thư mục cha `khong-gian-van-hoa-hcm`: bản phân tích +
prompt V1/V2, tài liệu điều chỉnh V3–V3.17, bản xem trước
`preview-trang-chinh-V3.html`, `supabase-schema.sql`,
`Huong-dan-cac-buoc-tiep-theo.md`.*
