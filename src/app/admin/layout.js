import Link from 'next/link';
import { createClient } from '../../lib/supabase/server';
import AdminShell from '../../components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Khu vực Admin — Không gian văn hóa Hồ Chí Minh' };

// Kiểm tra đăng nhập + hồ sơ phân quyền phía server.
// (Middleware đã chặn người chưa đăng nhập; ở đây kiểm tra tiếp
// tài khoản đã được cấp quyền trong bảng profiles hay chưa.)
export default async function AdminLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main>
        <div className="login-wrap">
          <div className="login-card">
            <h2>Khu vực Admin</h2>
            <p className="sub">
              Thầy/cô cần đăng nhập trước.{' '}
              <Link href="/dang-nhap" style={{ color: 'var(--red)', fontWeight: 800 }}>
                Đến trang đăng nhập →
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.status !== 'active') {
    return (
      <main>
        <div className="login-wrap">
          <div className="login-card">
            <h2>Chưa được cấp quyền</h2>
            <p className="sub" style={{ textAlign: 'left', lineHeight: 1.65 }}>
              Tài khoản <b>{user.email}</b> đã đăng nhập nhưng{' '}
              {profile
                ? 'đang bị khóa/thu hồi quyền.'
                : 'chưa có hồ sơ phân quyền trong hệ thống.'}{' '}
              Nếu thầy/cô đã gửi yêu cầu ở trang Đăng ký tài khoản, vui lòng
              chờ <b>Admin chính duyệt</b> — duyệt xong mới vào đăng bài được.
            </p>
            <p className="sub">
              <Link href="/" style={{ color: 'var(--red)', fontWeight: 800 }}>
                ← Quay lại trang chủ
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AdminShell user={user} profile={profile}>
      {children}
    </AdminShell>
  );
}
