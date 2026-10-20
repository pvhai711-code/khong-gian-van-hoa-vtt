'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../../../components/admin/AdminShell';
import { writeAudit } from '../../../lib/audit';

const EMPTY = { period_label: '', title: '', body: '', image_url: '', sort_order: 0 };

export default function TimelinePage() {
  const { supabase, user, role } = useAdmin();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const canEdit = role === 'admin' || role === 'editor';

  async function load() {
    const { data } = await supabase
      .from('timeline_events')
      .select('*')
      .order('sort_order');
    setEvents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    const payload = {
      period_label: form.period_label.trim(),
      title: form.title.trim(),
      body: form.body.trim() || null,
      image_url: form.image_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (editingId) {
        const { error } = await supabase
          .from('timeline_events')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        await writeAudit(supabase, user.id, 'update_timeline', payload.title);
        setMsg('Đã sửa mốc thời gian.');
      } else {
        const { error } = await supabase.from('timeline_events').insert(payload);
        if (error) throw error;
        await writeAudit(supabase, user.id, 'create_timeline', payload.title);
        setMsg('Đã thêm mốc thời gian mới.');
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (e2) {
      setErr('Không lưu được: ' + e2.message);
    }
  }

  async function remove(ev) {
    if (!window.confirm(`Xóa mốc “${ev.period_label} — ${ev.title}”?`)) return;
    const { error } = await supabase.from('timeline_events').delete().eq('id', ev.id);
    if (error) {
      setErr('Xóa thất bại: ' + error.message);
      return;
    }
    setMsg('Đã xóa mốc thời gian.');
    load();
  }

  return (
    <>
      <h2>Mốc thời gian — Cuộc đời, sự nghiệp</h2>
      <p className="sub">
        Các mốc hiện trên trang “Cuộc đời, sự nghiệp” theo thứ tự tăng dần.
        {!canEdit && ' Tài khoản Cộng tác viên chỉ xem, không sửa được mục này.'}
      </p>
      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <div className="alert alert-err">{err}</div>}

      {canEdit && (
        <form className="frm" onSubmit={onSubmit} style={{ marginBottom: 22 }}>
          <label>Nhãn thời gian * (ví dụ: Tháng 6/1911)</label>
          <input required value={form.period_label} onChange={set('period_label')} />
          <label>Tiêu đề mốc *</label>
          <input required value={form.title} onChange={set('title')} />
          <label>Nội dung</label>
          <textarea rows={3} value={form.body} onChange={set('body')} />
          <label>Link ảnh minh họa (không bắt buộc)</label>
          <input value={form.image_url} onChange={set('image_url')} placeholder="https://..." />
          <label>Thứ tự hiển thị</label>
          <input type="number" value={form.sort_order} onChange={set('sort_order')} />
          <button className="btn-full" type="submit">
            {editingId ? 'Lưu mốc thời gian' : 'Thêm mốc thời gian'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-reg"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
              }}
            >
              Hủy sửa
            </button>
          )}
        </form>
      )}

      {loading ? (
        <p className="spin">Đang tải...</p>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Thứ tự</th>
              <th>Thời gian</th>
              <th>Tiêu đề</th>
              {canEdit && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.sort_order}</td>
                <td>
                  <b>{ev.period_label}</b>
                </td>
                <td>{ev.title}</td>
                {canEdit && (
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="mini-btn"
                      onClick={() => {
                        setEditingId(ev.id);
                        setForm({
                          period_label: ev.period_label || '',
                          title: ev.title || '',
                          body: ev.body || '',
                          image_url: ev.image_url || '',
                          sort_order: ev.sort_order || 0,
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Sửa
                    </button>
                    <button className="mini-btn btn-danger" onClick={() => remove(ev)}>
                      Xóa
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
