import Link from 'next/link';
import { createClient } from '../lib/supabase/server';
import { createAdminClient } from '../lib/supabase/admin';

// Chân trang: cột logo + thông tin trường + liên hệ + thống kê truy cập.
// Nội dung lấy từ bảng site_settings (Admin sửa được ở mục Cài đặt trang).
// Riêng thống kê: Đang online = số phiên còn hoạt động trong 5 phút gần nhất,
// Tổng = số khởi điểm thầy nhập trong Admin + số lượt đếm tự động. Nếu bảng
// đếm chưa được tạo (chưa chạy SQL) thì hiện lại số thầy nhập tay như trước.
async function getLiveStats() {
  try {
    const supabase = createAdminClient() || createClient();
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: online } = await supabase
      .from('visitor_sessions')
      .select('*', { count: 'exact', head: true })
      .gt('last_seen', fiveMinAgo);
    const { data } = await supabase.from('visitor_sessions').select('visits');
    const visits = (data || []).reduce((s, r) => s + (r.visits || 0), 0);
    return { online: online || 0, visits };
  } catch {
    return null;
  }
}

export default async function SiteFooter({ settings }) {
  const school = settings?.school || {};
  const manual = settings?.stats || { online: 189, total: 180801 };
  const live = await getLiveStats();
  const online = live ? live.online : manual.online;
  const total = (Number(manual.total) || 0) + (live ? live.visits : 0);
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
            <p className="foot-school">
              <span className="fs-line">
                <b>Website:</b>{' '}
                <a
                  href="https://thptvotruongtoan.hcm.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                >
                  thptvotruongtoan.hcm.edu.vn
                </a>
              </span>
              <br />
              <span className="fs-line">
                <b>Page Trường:</b> Trường THPT Võ Trường Toản
              </span>
              <br />
              <span className="fs-line fs-line-sm">
                <b>Page Đảng bộ:</b> Đảng bộ trường THPT Võ Trường Toản
              </span>
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
              Đang online: <b>{online}</b>
              <br />
              Tổng số truy cập: <b>{total.toLocaleString('vi-VN')}</b>
            </p>
            <p style={{ marginTop: 10 }}>
              <Link href="/">› Trang chủ</Link> &nbsp;&nbsp;
              <Link href="/lien-he">› Liên hệ</Link>
              <br />
              <a href="/rss">› RSS</a> &nbsp;&nbsp;
              <Link href="/so-do-trang">› Sơ đồ cổng thông tin</Link>
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
