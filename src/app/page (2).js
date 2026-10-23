import Link from 'next/link';
import { getCategories } from '../../lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sơ đồ cổng thông tin — Không gian văn hóa Hồ Chí Minh',
};

const linkStyle = { color: 'var(--red-dark)', fontWeight: 600, lineHeight: 2.1 };

export default async function SoDoTrangPage() {
  const categories = await getCategories();

  return (
    <main>
      <section className="sec wrap" style={{ paddingTop: 22 }}>
        <div className="crumb">
          <Link href="/">Trang chủ</Link> / <b>Sơ đồ cổng thông tin</b>
        </div>
        <div className="sec-head">
          <h2>Sơ đồ cổng thông tin</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 26,
            maxWidth: 900,
          }}
        >
          <div>
            <h3 style={{ marginBottom: 8 }}>Trang chính</h3>
            <ul style={{ listStyle: 'none' }}>
              <li>
                <Link href="/" style={linkStyle}>› Trang chủ</Link>
              </li>
              <li>
                <Link href="/cuoc-doi" style={linkStyle}>
                  › Cuộc đời, sự nghiệp Hồ Chí Minh
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" style={linkStyle}>› Tin tức</Link>
              </li>
              <li>
                <a
                  href="https://map3d.visithcmc.vn/?startscene=scene_bnr_view4"
                  target="_blank"
                  rel="noreferrer"
                  style={linkStyle}
                >
                  › Tham quan 3D Bến Nhà Rồng
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={{ marginBottom: 8 }}>Chuyên mục</h3>
            <ul style={{ listStyle: 'none' }}>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/chuyen-muc/${c.slug}`} style={linkStyle}>
                    › {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ marginBottom: 8 }}>Tiện ích</h3>
            <ul style={{ listStyle: 'none' }}>
              <li>
                <Link href="/lien-he" style={linkStyle}>› Liên hệ</Link>
              </li>
              <li>
                <a href="/rss" style={linkStyle}>› RSS — tin mới nhất</a>
              </li>
              <li>
                <Link href="/dang-nhap" style={linkStyle}>› Đăng nhập</Link>
              </li>
              <li>
                <Link href="/dang-ky" style={linkStyle}>
                  › Đăng ký tài khoản cộng tác
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
