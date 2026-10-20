'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../../../components/admin/AdminShell';
import { formatTime } from '../../../lib/utils';
import { writeAudit } from '../../../lib/audit';

export default function MediaPage() {
  const { supabase, user, isAdmin } = useAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function onUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setErr('');
    setMsg('');
    let done = 0;
    try {
      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        const bucket = isVideo ? 'videos' : 'images';
        const safe = file.name
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-zA-Z0-9._-]+/g, '-');
        const path = `${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        const { error: insErr } = await supabase.from('media').insert({
          url: data.publicUrl,
          path: `${bucket}/${path}`,
          kind: isVideo ? 'video' : 'image',
          caption: file.name,
          uploaded_by: user.id,
        });
        if (insErr) throw insErr;
        done += 1;
      }
      setMsg(`Đã tải lên ${done} tệp.`);
      await writeAudit(supabase, user.id, 'upload_media', `${done} tệp`);
      load();
    } catch (e2) {
      setErr('Tải lên thất bại: ' + e2.message);
    }
    setUploading(false);
    e.target.value = '';
  }

  async function copyUrl(item) {
    try {
      await navigator.clipboard.writeText(item.url);
      setMsg('Đã sao chép link: ' + item.url);
    } catch {
      setMsg('Link của tệp: ' + item.url);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Xóa tệp “${item.caption || item.url}” khỏi thư viện? Ảnh đã chèn trong bài viết sẽ không hiện nữa.`)) return;
    try {
      if (item.path && item.path.includes('/')) {
        const [bucket, ...rest] = item.path.split('/');
        await supabase.storage.from(bucket).remove([rest.join('/')]);
      }
      const { error } = await supabase.from('media').delete().eq('id', item.id);
      if (error) throw error;
      setMsg('Đã xóa tệp khỏi thư viện.');
      load();
    } catch (e2) {
      setErr('Xóa thất bại: ' + e2.message);
    }
  }

  return (
    <>
      <h2>Thư viện media</h2>
      <p className="sub">
        Tải ảnh/video lên kho lưu trữ của website. Ảnh bìa khi đăng bài cũng
        tự được lưu vào đây. Bấm “Sao chép link” để dùng ảnh ở nơi khác.
      </p>
      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <div className="alert alert-err">{err}</div>}
      <label className="mini-btn" style={{ cursor: 'pointer', display: 'inline-block', padding: '9px 16px', fontSize: 14 }}>
        {uploading ? 'Đang tải lên...' : '⬆ Tải ảnh / video từ máy'}
        <input type="file" accept="image/*,video/*" multiple hidden onChange={onUpload} />
      </label>

      {loading ? (
        <p className="spin">Đang tải thư viện...</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--grey)', fontSize: 14, marginTop: 14 }}>
          Thư viện đang trống. Tải tệp đầu tiên lên nhé.
        </p>
      ) : (
        <div className="media-grid">
          {items.map((item) => (
            <div className="media-cell" key={item.id}>
              <div className="mthumb">
                {item.kind === 'video' ? (
                  <span className="vid">🎬</span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.caption || 'Ảnh'} />
                )}
              </div>
              <div className="minfo">
                <b style={{ color: 'var(--ink)' }}>{item.caption || '(không tên)'}</b>
                <br />
                {item.kind === 'video' ? 'Video' : 'Ảnh'} • {formatTime(item.created_at)}
              </div>
              <div className="mact">
                <button className="mini-btn" onClick={() => copyUrl(item)}>
                  Sao chép link
                </button>
                {(isAdmin || item.uploaded_by === user.id) && (
                  <button className="mini-btn btn-danger" onClick={() => remove(item)}>
                    Xóa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
