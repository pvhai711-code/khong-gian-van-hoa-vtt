'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../../../components/admin/AdminShell';
import { writeAudit } from '../../../lib/audit';

export default function SettingsPage() {
  const { supabase, user, isAdmin } = useAdmin();
  const [school, setSchool] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    email: '',
    phone: '',
  });
  const [banner, setBanner] = useState('');
  const [stats, setStats] = useState({ online: 189, total: 180801 });
  const [portrait, setPortrait] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      (data || []).forEach((row) => {
        if (row.key === 'school') setSchool((s) => ({ ...s, ...row.value }));
        if (row.key === 'banner') setBanner(row.value?.text || '');
        if (row.key === 'stats') setStats((s) => ({ ...s, ...row.value }));
        if (row.key === 'portrait') setPortrait(row.value?.url || '');
      });
      setLoading(false);
    })();
  }, [supabase]);

  async function saveKey(key, value, label) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' });
    if (error) throw new Error(`${label}: ${error.message}`);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      await saveKey('school', school, 'Thông tin trường');
      await saveKey('banner', { text: banner }, 'Banner chuyên đề');
      await saveKey(
        'stats',
        { online: Number(stats.online) || 0, total: Number(stats.total) || 0 },
        'Thống kê'
      );
      await saveKey('portrait', { url: portrait }, 'Ảnh chân dung');
      await writeAudit(supabase, user.id, 'update_settings', 'Cài đặt trang');
      setMsg('Đã lưu cài đặt. Thay đổi hiện ngay trên website (tải lại trang chủ để xem).');
    } catch (e2) {
      setErr('Lưu thất bại — ' + e2.message);
    }
  }

  if (!isAdmin) {
    return (
      <>
        <h2>Cài đặt trang</h2>
        <div className="alert alert-warn">Chỉ Admin chính mới sửa được cài đặt trang.</div>
      </>
    );
  }

  const setS = (k) => (e) => setSchool((s) => ({ ...s, [k]: e.target.value }));

  return (
    <>
      <h2>Cài đặt trang</h2>
      <p className="sub">
        Thông tin hiện ở chân trang (footer), banner chuyên đề đỏ ở trang chủ
        và số liệu thống kê truy cập. Chỉ Admin chính sửa được.
      </p>
      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <div className="alert alert-err">{err}</div>}
      {loading ? (
        <p className="spin">Đang tải cài đặt...</p>
      ) : (
        <form className="frm" onSubmit={onSubmit}>
          <h3 style={{ marginTop: 6 }}>Thông tin trường (footer)</h3>
          <label>Tên trường</label>
          <input value={school.name} onChange={setS('name')} />
          <label>Dòng địa chỉ 1</label>
          <input value={school.address_line1} onChange={setS('address_line1')} />
          <label>Dòng địa chỉ 2</label>
          <input value={school.address_line2} onChange={setS('address_line2')} />
          <label>Email liên hệ / quản trị</label>
          <input value={school.email} onChange={setS('email')} />
          <label>Điện thoại</label>
          <input value={school.phone} onChange={setS('phone')} />

          <h3 style={{ marginTop: 20 }}>Banner chuyên đề (trang chủ)</h3>
          <label>Nội dung banner đỏ dưới mục Tin mới</label>
          <textarea rows={3} value={banner} onChange={(e) => setBanner(e.target.value)} />

          <h3 style={{ marginTop: 20 }}>Ảnh chân dung Chủ tịch Hồ Chí Minh</h3>
          <label>
            Link ảnh chân dung (để trống = dùng ảnh mặc định /chan-dung-bac.png
            trong mã nguồn). Tải ảnh mới lên ở Thư viện media rồi dán link vào
            đây.
          </label>
          <input
            value={portrait}
            onChange={(e) => setPortrait(e.target.value)}
            placeholder="https://... (hoặc để trống)"
          />

          <h3 style={{ marginTop: 20 }}>Thống kê truy cập (footer)</h3>
          <label>Đang online</label>
          <input
            type="number"
            value={stats.online}
            onChange={(e) => setStats((s) => ({ ...s, online: e.target.value }))}
          />
          <label>Tổng số truy cập</label>
          <input
            type="number"
            value={stats.total}
            onChange={(e) => setStats((s) => ({ ...s, total: e.target.value }))}
          />

          <button className="btn-full" type="submit">
            Lưu cài đặt
          </button>
          <p style={{ fontSize: 13, color: 'var(--grey)', marginTop: 10, lineHeight: 1.6 }}>
            Lưu ý: logo trường ở header/footer là file <b>/logo.png</b> trong
            mã nguồn — muốn đổi logo, thay file đó rồi Deploy lại (hoặc nhờ hỗ
            trợ kỹ thuật). Tên chuyên mục sửa ở mục <b>Chuyên mục</b>.
          </p>
        </form>
      )}
    </>
  );
}
