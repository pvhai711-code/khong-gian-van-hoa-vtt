'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../../../components/admin/AdminShell';
import { ROLE_LABELS, formatTime } from '../../../lib/utils';

export default function AccountsPage() {
  const { supabase, user, isAdmin } = useAdmin();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'editor',
  });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');
    setProfiles(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, isAdmin]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function createAccount(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tạo tài khoản thất bại');
      setMsg(
        `Đã tạo tài khoản ${form.email} (${ROLE_LABELS[form.role]}). Người này đăng nhập và đăng bài được ngay bằng mật khẩu thầy vừa đặt.`
      );
      setForm({ full_name: '', email: '', password: '', role: 'editor' });
      load();
    } catch (e2) {
      setErr(e2.message);
    }
    setCreating(false);
  }

  async function changeField(profile, field, value) {
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', profile.id);
    if (error) {
      setErr('Cập nhật thất bại: ' + error.message);
      return;
    }
    setMsg(`Đã cập nhật tài khoản ${profile.email}.`);
    load();
  }

  async function removeAccount(profile) {
    if (profile.id === user.id) {
      setErr('Không thể tự xóa tài khoản Admin chính đang đăng nhập.');
      return;
    }
    if (!window.confirm(`Xóa hẳn tài khoản ${profile.email}? Người này sẽ không đăng nhập được nữa.`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Xóa thất bại');
      setMsg(`Đã xóa tài khoản ${profile.email}.`);
      load();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  if (!isAdmin) {
    return (
      <>
        <h2>Quản lý tài khoản</h2>
        <div className="alert alert-warn">Chỉ Admin chính mới quản lý được tài khoản.</div>
      </>
    );
  }

  return (
    <>
      <h2>Quản lý tài khoản</h2>
      <p className="sub">
        Chỉ Admin chính vào được mục này. Admin có thể chủ động cấp tài khoản
        cho giáo viên/học sinh, đổi cấp quyền, khóa hoặc xóa tài khoản.
      </p>
      <div className="alert alert-warn">
        <b>Bảng phân quyền:</b> <b>Admin chính</b> — toàn quyền, quản lý tài
        khoản &amp; cài đặt. <b>Biên tập viên</b> — đăng bài trực tiếp, chỉ
        sửa/xóa bài của mình. <b>Cộng tác viên</b> — gửi bài <b>chờ duyệt</b>,
        Admin duyệt mới hiện lên website.
      </div>
      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <div className="alert alert-err">{err}</div>}

      {loading ? (
        <p className="spin">Đang tải danh sách tài khoản...</p>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Cấp quyền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{p.full_name || '(chưa có tên)'}</b>
                  <br />
                  <small style={{ color: 'var(--grey)' }}>{p.email}</small>
                </td>
                <td>
                  <select
                    className="role-sel"
                    value={p.role}
                    disabled={p.id === user.id}
                    onChange={(e) => changeField(p, 'role', e.target.value)}
                  >
                    <option value="admin">Admin chính</option>
                    <option value="editor">Biên tập viên</option>
                    <option value="ctv">Cộng tác viên</option>
                  </select>
                </td>
                <td>
                  <select
                    className="status-sel"
                    value={p.status}
                    disabled={p.id === user.id}
                    onChange={(e) => changeField(p, 'status', e.target.value)}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                </td>
                <td>{formatTime(p.created_at)}</td>
                <td>
                  {p.id !== user.id && (
                    <button className="mini-btn btn-danger" onClick={() => removeAccount(p)}>
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ margin: '22px 0 4px' }}>Cấp tài khoản mới</h3>
      <form className="frm" onSubmit={createAccount} style={{ maxWidth: 560 }}>
        <label>Họ và tên</label>
        <input value={form.full_name} onChange={set('full_name')} placeholder="Ví dụ: Cô Nguyễn Thị A" />
        <label>Email đăng nhập *</label>
        <input type="email" required value={form.email} onChange={set('email')} placeholder="vidu@thptvotruongtoan.edu.vn" />
        <label>Mật khẩu tạm *</label>
        <input required minLength={6} value={form.password} onChange={set('password')} placeholder="Ít nhất 6 ký tự — thầy gửi riêng cho người được cấp" />
        <label>Cấp quyền *</label>
        <select value={form.role} onChange={set('role')}>
          <option value="editor">Biên tập viên — đăng bài trực tiếp</option>
          <option value="ctv">Cộng tác viên — gửi bài chờ duyệt</option>
          <option value="admin">Admin chính — toàn quyền (chỉ cấp khi thật cần)</option>
        </select>
        <button className="btn-full" type="submit" disabled={creating}>
          {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
        </button>
      </form>
      <p style={{ fontSize: 13, color: 'var(--grey)', marginTop: 10, lineHeight: 1.6 }}>
        Lưu ý kỹ thuật: việc tạo tài khoản đăng nhập do server thực hiện bằng
        khóa bí mật của Supabase. Nếu gặp thông báo “chưa cấu hình khóa bí
        mật”, thầy cần thêm biến <b>SUPABASE_SERVICE_ROLE_KEY</b> trong Vercel
        (xem README) rồi Deploy lại.
      </p>
    </>
  );
}
