'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    desired_role: 'ctv',
    unit: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: insErr } = await supabase.from('account_requests').insert({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      desired_role: form.desired_role,
      unit: form.unit.trim() || null,
      note: form.note.trim() || null,
      status: 'pending',
    });
    setLoading(false);
    if (insErr) {
      if (insErr.code === '23505') {
        setError(
          'Email này đã gửi yêu cầu đăng ký (hoặc đã có tài khoản). Nếu đang chờ duyệt, thầy/cô vui lòng chờ Admin chính xử lý.'
        );
      } else {
        setError('Không gửi được yêu cầu: ' + insErr.message);
      }
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0 });
  }

  return (
    <main>
      <div className="login-wrap">
        <div className="login-card">
          <h2>Đăng ký tài khoản</h2>
          <p className="sub">
            Đăng ký để được cấp quyền đăng bài. Tài khoản chỉ hoạt động{' '}
            <b>sau khi Admin chính duyệt</b>.
          </p>
          {!done ? (
            <form className="frm" onSubmit={onSubmit}>
              <label>Họ và tên *</label>
              <input
                required
                placeholder="Ví dụ: Trần Thị B"
                value={form.full_name}
                onChange={set('full_name')}
              />
              <label>Email *</label>
              <input
                type="email"
                required
                placeholder="vidu@thptvotruongtoan.edu.vn"
                value={form.email}
                onChange={set('email')}
              />
              <label>Cấp quyền mong muốn *</label>
              <select value={form.desired_role} onChange={set('desired_role')}>
                <option value="editor">
                  Biên tập viên — đăng bài trực tiếp sau khi được duyệt
                </option>
                <option value="ctv">
                  Cộng tác viên — gửi bài chờ Admin duyệt
                </option>
              </select>
              <label>Lớp / Tổ chuyên môn (không bắt buộc)</label>
              <input
                placeholder="Ví dụ: Lớp 11A1, Tổ Tin học..."
                value={form.unit}
                onChange={set('unit')}
              />
              <label>Lời nhắn cho Admin (không bắt buộc)</label>
              <textarea
                rows={2}
                placeholder="Giới thiệu ngắn để Admin dễ nhận diện..."
                value={form.note}
                onChange={set('note')}
              />
              <div className={`err${error ? ' show' : ''}`}>{error}</div>
              <button className="btn-full" type="submit" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu đăng ký'}
              </button>
            </form>
          ) : (
            <div className="ok-box show">
              <b>Đã gửi yêu cầu đăng ký thành công!</b>
              <br />
              Yêu cầu của bạn đang ở trạng thái <b>chờ Admin chính duyệt</b>.
              Khi được duyệt, Admin sẽ tạo tài khoản và gửi bạn{' '}
              <b>mật khẩu tạm</b> — dùng email của bạn + mật khẩu tạm đó để
              đăng nhập và bắt đầu đăng bài (nhớ đổi mật khẩu sau khi vào
              được).
              <br />
              <Link href="/dang-nhap">
                <button className="btn-reg" type="button">
                  Về trang đăng nhập
                </button>
              </Link>
            </div>
          )}
          <p style={{ marginTop: 14, fontSize: 13, color: 'var(--grey)' }}>
            Lưu ý: Không thể tự đăng ký làm Admin chính. Admin chính có quyền
            đổi cấp quyền khi duyệt, hoặc từ chối yêu cầu không phù hợp.
          </p>
        </div>
      </div>
    </main>
  );
}
