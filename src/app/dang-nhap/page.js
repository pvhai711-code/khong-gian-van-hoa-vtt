'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { data, error: signErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signErr) {
      setLoading(false);
      setError(
        'Email hoặc mật khẩu chưa đúng. Thầy/cô kiểm tra lại, hoặc liên hệ Admin chính để được cấp lại mật khẩu.'
      );
      return;
    }
    // Kiểm tra tài khoản có bị khóa / chưa được cấp quyền không
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .maybeSingle();
    if (!profile) {
      await supabase.auth.signOut();
      setLoading(false);
      setError(
        'Tài khoản này chưa được cấp quyền đăng bài. Nếu thầy/cô đã gửi yêu cầu đăng ký, vui lòng chờ Admin chính duyệt.'
      );
      return;
    }
    if (profile.status !== 'active') {
      await supabase.auth.signOut();
      setLoading(false);
      setError('Tài khoản đã bị khóa/thu hồi. Vui lòng liên hệ Admin chính.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <main>
      <div className="login-wrap">
        <div className="login-card">
          <h2>Đăng nhập quản trị</h2>
          <p className="sub">
            Khu vực dành cho Admin và các tài khoản được cấp quyền đăng bài
          </p>
          <form className="frm" onSubmit={onSubmit}>
            <label>Email đăng nhập</label>
            <input
              type="email"
              required
              placeholder="vidu@truong.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Mật khẩu</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className={`err${error ? ' show' : ''}`}>{error}</div>
            <button className="btn-full" type="submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <Link href="/dang-ky">
            <button className="btn-reg" type="button">
              Đăng ký tài khoản
            </button>
          </Link>
          <p style={{ marginTop: 14, fontSize: 13, color: 'var(--grey)' }}>
            Chưa có tài khoản? Bấm <b>Đăng ký tài khoản</b> ở trên để gửi yêu
            cầu — <b>Admin chính duyệt</b> xong bạn mới đăng nhập và đăng bài
            được. Admin chính cũng có thể chủ động cấp tài khoản trong mục
            Quản lý tài khoản.
          </p>
        </div>
      </div>
    </main>
  );
}
