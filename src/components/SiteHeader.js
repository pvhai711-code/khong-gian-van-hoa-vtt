import Link from 'next/link';
import NavBar from './NavBar';

// Phần đầu trang: thanh đỏ nhỏ (Đăng nhập Admin) + header logo/tên trường
// + thanh menu đỏ. Dữ liệu chuyên mục truyền từ layout (bảng categories).
export default function SiteHeader({ categories, isLoggedIn }) {
  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>
            {isLoggedIn ? (
              <Link href="/admin">Vào khu vực Admin</Link>
            ) : (
              <Link href="/dang-nhap">Đăng nhập Admin</Link>
            )}
          </span>
        </div>
      </div>
      <header className="site">
        <div className="wrap header-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="logo"
            src="/logo.png"
            alt="Logo Trường THPT Võ Trường Toản"
          />
          <div className="titles">
            <div className="school-name">Không gian văn hóa Hồ Chí Minh</div>
            <div className="school-sub">Trường THPT Võ Trường Toản</div>
          </div>
          <form className="search" action="/tin-tuc" method="get">
            <input name="q" placeholder="Tìm bài viết, tư liệu..." />
            <button type="submit">Tìm</button>
          </form>
        </div>
      </header>
      <NavBar categories={categories} />
    </>
  );
}
