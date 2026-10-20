import Link from 'next/link';

// Chân trang: cột logo + thông tin trường + liên hệ + thống kê truy cập.
// Nội dung lấy từ bảng site_settings (Admin sửa được ở mục Cài đặt trang).
export default function SiteFooter({ settings }) {
  const school = settings?.school || {};
  const stats = settings?.stats || { online: 189, total: 180801 };
  const addr1 = (school.address_line1 || '').replace(/^Địa chỉ:\s*/i, '');
  const addr2 = school.address_line2 || '';

  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div className="flogo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo trường" />
          </div>
          <div>
            <h4>Trường THPT Võ Trường Toản</h4>
            <p>
              Địa chỉ: {addr1}
              <br />
              <span style={{ whiteSpace: 'nowrap' }}>{addr2}</span>
            </p>
          </div>
          <div>
            <h4>Thông tin liên hệ</h4>
            <p>
              Địa chỉ: {addr1}
              <br />
              <span style={{ whiteSpace: 'nowrap' }}>{addr2}</span>
              <br />
              Điện thoại: {school.phone || '(cập nhật trong Admin)'}
              <br />
              Email: {school.email || ''}
              <br />
              Quản trị website: {school.email || ''}
            </p>
          </div>
          <div>
            <h4>Thống kê truy cập</h4>
            <p style={{ fontSize: 15, lineHeight: 2.05 }}>
              Đang online: <b>{stats.online}</b>
              <br />
              Tổng số truy cập: <b>{Number(stats.total || 0).toLocaleString('vi-VN')}</b>
            </p>
            <p style={{ marginTop: 10 }}>
              <Link href="/">› Trang chủ</Link> &nbsp;&nbsp;
              <a href="#lien-he">› Liên hệ</a>
              <br />
              <a href="#rss">› RSS</a> &nbsp;&nbsp;
              <a href="#so-do">› Sơ đồ cổng thông tin</a>
            </p>
          </div>
        </div>
        <div className="copy">
          Bản quyền thuộc Trường THPT Võ Trường Toản — Ghi rõ nguồn khi phát
          hành lại thông tin từ website này.
        </div>
      </div>
    </footer>
  );
}
