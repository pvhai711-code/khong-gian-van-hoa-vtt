'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../../../components/admin/AdminShell';
import { writeAudit } from '../../../lib/audit';

export default function CategoriesPage() {
  const { supabase, user, isAdmin } = useAdmin();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      setCats(data || []);
      setLoading(false);
    })();
  }, [supabase]);

  const patch = (id, k, v) =>
    setCats((list) => list.map((c) => (c.id === id ? { ...c, [k]: v } : c)));

  async function save(cat) {
    setErr('');
    setMsg('');
    const { error } = await supabase
      .from('categories')
      .update({
        name: cat.name,
        short_desc: cat.short_desc,
        sort_order: Number(cat.sort_order) || 0,
        show_in_menu: !!cat.show_in_menu,
      })
      .eq('id', cat.id);
    if (error) {
      setErr('Lưu thất bại: ' + error.message);
      return;
    }
    await writeAudit(supabase, user.id, 'update_category', cat.name);
    setMsg(`Đã lưu chuyên mục “${cat.name}”. Tên mới sẽ hiện trên menu của website.`);
  }

  if (!isAdmin) {
    return (
      <>
        <h2>Chuyên mục</h2>
        <div className="alert alert-warn">Chỉ Admin chính mới sửa được chuyên mục.</div>
      </>
    );
  }

  return (
    <>
      <h2>Chuyên mục</h2>
      <p className="sub">
        Đổi tên hiển thị, mô tả ngắn, thứ tự và ẩn/hiện trên thanh menu đỏ.
        Đường dẫn (slug) được giữ cố định để không làm hỏng liên kết đã chia
        sẻ.
      </p>
      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <div className="alert alert-err">{err}</div>}
      {loading ? (
        <p className="spin">Đang tải...</p>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Tên chuyên mục</th>
              <th>Mô tả ngắn</th>
              <th style={{ width: 70 }}>Thứ tự</th>
              <th style={{ width: 80 }}>Hiện menu</th>
              <th style={{ width: 90 }}></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td>
                  <input
                    type="text"
                    value={c.name || ''}
                    onChange={(e) => patch(c.id, 'name', e.target.value)}
                  />
                  <small style={{ color: 'var(--grey)' }}>
                    /{c.slug}
                    {c.is_external ? ' • liên kết ngoài ↗' : ''}
                  </small>
                </td>
                <td>
                  <input
                    type="text"
                    value={c.short_desc || ''}
                    onChange={(e) => patch(c.id, 'short_desc', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={c.sort_order ?? 0}
                    onChange={(e) => patch(c.id, 'sort_order', e.target.value)}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!!c.show_in_menu}
                    onChange={(e) => patch(c.id, 'show_in_menu', e.target.checked)}
                  />
                </td>
                <td>
                  <button className="mini-btn" onClick={() => save(c)}>
                    Lưu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
