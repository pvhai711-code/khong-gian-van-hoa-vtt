import Link from 'next/link';
import { getSettings } from '../../lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Liên hệ — Không gian văn hóa Hồ Chí Minh',
};

export default async function LienHePage() {
  const settings = await getSettings();
  const school = settings?.school || {};
  const addr1 = (school.address_line1 || '').replace(/^Địa chỉ:\s*/i, '');
  const addr2 = school.address_line2 || '';

  return (
    <main>
      <section className="sec wrap" style={{ paddingTop: 22 }}>
        <div className="crumb">
          <Link href="/">Trang chủ</Link> / <b>Liên hệ</b>
        </div>
        <div className="sec-head">
          <h2>Thông tin liên hệ</h2>
        </div>
        <div
          style={{
            background: '#FFFDF5',
            border: '1.5px solid #eee3c8',
            borderRadius: 14,
            padding: '22px 26px',
            maxWidth: 720,
            lineHeight: 2.1,
            fontSize: 15.5,
          }}
        >
          <p>
            <b style={{ fontSize: 18, color: 'var(--red-dark)' }}>
              Trường THPT Võ Trường Toản
            </b>
          </p>
          <p>
            <b>Địa chỉ:</b> {addr1}
            {addr2 ? (
              <>
                <br />
                <span style={{ marginLeft: 62 }}>{addr2}</span>
              </>
            ) : null}
          </p>
          <p>
            <b>Điện thoại:</b> {school.phone || '(đang cập nhật)'}
          </p>
          <p>
            <b>Email:</b> {school.email || '(đang cập nhật)'}
          </p>
          <p>
            <b>Quản trị website:</b> {school.email || '(đang cập nhật)'}
          </p>
        </div>
        <p style={{ marginTop: 16, maxWidth: 720, lineHeight: 1.8 }}>
          Mọi góp ý về nội dung Không gian văn hóa Hồ Chí Minh, hoặc đăng ký
          cộng tác viết bài cho trang, xin liên hệ Ban quản trị website qua
          điện thoại hoặc email của trường. Giáo viên và học sinh của trường
          có thể <Link href="/dang-ky">đăng ký tài khoản</Link> để gửi bài —
          bài viết sẽ được Ban quản trị duyệt trước khi đăng lên trang.
        </p>
      </section>
    </main>
  );
}
