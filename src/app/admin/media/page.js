'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../../../components/admin/AdminShell';
import { formatTime } from '../../../lib/utils';
import { writeAudit } from '../../../lib/audit';

// Thư viện media: tải ảnh/video lên kho của website, chia theo từng
// phần sự kiện (album). Mỗi sự kiện là một phần riêng: chọn phần rồi
// tải tệp lên, tệp sẽ nằm trong phần đó. Tệp chưa xếp phần nào nằm ở
// "Chưa phân loại" và có thể chuyển phần sau.
// ban-sua-24: tệp > 6MB tải lên theo từng khúc 6MB (chuẩn TUS của
// Supabase) thay vì một request dài — khúc nào rớt mạng thì tự tải
// lại khúc đó, không phải tải lại từ đầu. Tệp nhỏ giữ nguyên cách cũ.
export default function MediaPage() {
  const { supabase, user, isAdmin } = useAdmin();
  const [albums, setAlbums] = useState([]);
  const [sel, setSel] = useState('all'); // 'all' | 'none' | albumId (number)
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [capDraft, setCapDraft] = useState({}); // lời giới thiệu đang gõ, theo id tệp

  const selAlbum =
    typeof sel === 'number' ? albums.find((a) => a.id === sel) : null;

  async function loadAlbums() {
    const { data } = await supabase
      .from('media_albums')
      .select('*')
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    setAlbums(data || []);
  }

  async function loadItems(selValue) {
    setLoading(true);
    let q = supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });
    if (selValue === 'none') q = q.is('album_id', null);
    else if (selValue !== 'all') q = q.eq('album_id', selValue);
    const { data } = await q;
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    loadItems(sel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, sel]);

  async function createAlbum(e) {
    e.preventDefault();
    if (!title.trim()) {
      setErr('Nhập tên sự kiện trước nhé.');
      return;
    }
    setErr('');
    const { error } = await supabase.from('media_albums').insert({
      title: title.trim(),
      description: desc.trim() || null,
      event_date: eventDate || null,
      created_by: user.id,
    });
    if (error) {
      setErr('Tạo phần sự kiện thất bại: ' + error.message);
      return;
    }
    setMsg(`Đã tạo phần sự kiện “${title.trim()}”.`);
    setTitle('');
    setDesc('');
    setEventDate('');
    setShowForm(false);
    loadAlbums();
  }

  async function removeAlbum(album) {
    if (
      !window.confirm(
        `Xóa phần sự kiện “${album.title}”? Ảnh/video bên trong sẽ chuyển về “Chưa phân loại”, không bị xóa.`
      )
    )
      return;
    const { error } = await supabase
      .from('media_albums')
      .delete()
      .eq('id', album.id);
    if (error) {
      setErr('Xóa phần sự kiện thất bại: ' + error.message);
      return;
    }
    setMsg('Đã xóa phần sự kiện.');
    if (sel === album.id) setSel('all');
    loadAlbums();
  }

  // Tải tệp lớn lên kho theo từng khúc 6MB (chuẩn TUS của Supabase):
  // mỗi khúc là một request ngắn, khúc nào rớt mạng thì tự tải lại
  // khúc đó (tối đa 4 lần, chờ lâu dần), không phải tải lại từ đầu.
  // Chỉ dùng cho tệp > 6MB; tệp nhỏ giữ nguyên cách tải cũ đã chạy ổn.
  async function uploadLargeFile(bucket, path, file) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = session?.access_token || anon;
    const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
    const create = await fetch(`${base}/storage/v1/upload/resumable`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        apikey: anon,
        'Upload-Length': String(file.size),
        'Upload-Metadata': `bucketName ${b64(bucket)},objectName ${b64(
          path
        )},contentType ${b64(file.type || 'application/octet-stream')}`,
        'Tus-Resumable': '1.0.0',
      },
    });
    if (!create.ok) {
      const t = await create.text().catch(() => '');
      throw new Error(
        `Không khởi tạo được phiên tải lên (mã ${create.status}) ${t.slice(0, 120)}`
      );
    }
    let url = create.headers.get('Location');
    if (!url) throw new Error('Máy chủ không trả về địa chỉ tải lên.');
    if (url.startsWith('/')) url = base + url;
    const CHUNK = 6 * 1024 * 1024;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let offset = 0;
    while (offset < file.size) {
      const end = Math.min(offset + CHUNK, file.size);
      const chunk = file.slice(offset, end);
      let doneChunk = false;
      let lastErr = null;
      for (let attempt = 0; attempt < 4 && !doneChunk; attempt++) {
        try {
          const res = await fetch(url, {
            method: 'PATCH',
            headers: {
              authorization: `Bearer ${token}`,
              apikey: anon,
              'Content-Type': 'application/offset+octet-stream',
              'Upload-Offset': String(offset),
              'Tus-Resumable': '1.0.0',
            },
            body: chunk,
          });
          if (res.status === 204) {
            const next = res.headers.get('Upload-Offset');
            offset = next ? parseInt(next, 10) : end;
            doneChunk = true;
          } else {
            // Máy chủ có thể đã nhận khúc này nhưng trả lời lỗi:
            // hỏi lại vị trí thật rồi đi tiếp từ đó.
            try {
              const head = await fetch(url, {
                method: 'HEAD',
                headers: {
                  authorization: `Bearer ${token}`,
                  apikey: anon,
                  'Tus-Resumable': '1.0.0',
                },
              });
              const cur = head.headers.get('Upload-Offset');
              if (head.ok && cur !== null && parseInt(cur, 10) > offset) {
                offset = parseInt(cur, 10);
                doneChunk = true;
              } else {
                lastErr = new Error(`Máy chủ trả mã ${res.status}`);
                await sleep(1500 * (attempt + 1));
              }
            } catch {
              lastErr = new Error(`Máy chủ trả mã ${res.status}`);
              await sleep(1500 * (attempt + 1));
            }
          }
        } catch (e3) {
          lastErr = e3;
          await sleep(1500 * (attempt + 1));
        }
      }
      if (!doneChunk) {
        const pct = Math.floor((offset / file.size) * 100);
        throw new Error(
          `Mất kết nối khi đang tải (đã lên được ${pct}%). Thầy bấm tải lại giúp em.`
        );
      }
      setMsg(
        `Đang tải lên “${file.name}”: ${Math.floor(
          (offset / file.size) * 100
        )}%`
      );
    }
  }

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
        if (file.size > 6 * 1024 * 1024) {
          setMsg(`Đang tải lên “${file.name}”: 0%`);
          await uploadLargeFile(bucket, path, file);
        } else {
          const { error: upErr } = await supabase.storage
            .from(bucket)
            .upload(path, file);
          if (upErr) throw upErr;
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        const { error: insErr } = await supabase.from('media').insert({
          url: data.publicUrl,
          path: `${bucket}/${path}`,
          kind: isVideo ? 'video' : 'image',
          caption: file.name,
          uploaded_by: user.id,
          album_id: typeof sel === 'number' ? sel : null,
        });
        if (insErr) throw insErr;
        done += 1;
      }
      setMsg(`Đã tải lên ${done} tệp.`);
      await writeAudit(supabase, user.id, 'upload_media', `${done} tệp`);
      loadItems(sel);
    } catch (e2) {
      setErr('Tải lên thất bại: ' + e2.message);
    }
    setUploading(false);
    e.target.value = '';
  }

  async function moveItem(item, albumId) {
    const { error } = await supabase
      .from('media')
      .update({ album_id: albumId || null })
      .eq('id', item.id);
    if (error) {
      setErr('Chuyển phần thất bại: ' + error.message);
      return;
    }
    loadItems(sel);
  }

  async function saveCaption(item) {
    const text = (capDraft[item.id] ?? item.caption ?? '').trim();
    const { error } = await supabase
      .from('media')
      .update({ caption: text || null })
      .eq('id', item.id);
    if (error) {
      setErr('Lưu chú thích thất bại: ' + error.message);
      return;
    }
    setMsg('Đã lưu lời giới thiệu cho ảnh.');
    loadItems(sel);
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
    if (
      !window.confirm(
        `Xóa tệp “${item.caption || item.url}” khỏi thư viện? Ảnh đã chèn trong bài viết sẽ không hiện nữa.`
      )
    )
      return;
    try {
      if (item.path && item.path.includes('/')) {
        const [bucket, ...rest] = item.path.split('/');
        await supabase.storage.from(bucket).remove([rest.join('/')]);
      }
      const { error } = await supabase.from('media').delete().eq('id', item.id);
      if (error) throw error;
      setMsg('Đã xóa tệp khỏi thư viện.');
      loadItems(sel);
    } catch (e2) {
      setErr('Xóa thất bại: ' + e2.message);
    }
  }

  return (
    <>
      <h2>Thư viện media</h2>
      <p className="sub">
        Tải ảnh/video lên kho lưu trữ của website, chia theo từng phần sự
        kiện. Ảnh bìa khi đăng bài cũng tự được lưu vào đây. Bấm “Sao chép
        link” để dùng ảnh ở nơi khác. Gõ lời giới thiệu ngắn vào ô dưới mỗi
        ảnh rồi bấm “Lưu chú thích” — lời này sẽ hiện ở trang chi tiết khi
        người xem bấm vào ảnh.
      </p>
      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <div className="alert alert-err">{err}</div>}

      {/* ===== Các phần sự kiện ===== */}
      <div style={{ margin: '14px 0 6px' }}>
        <button
          type="button"
          className="mini-btn"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? '✕ Đóng' : '＋ Tạo phần sự kiện mới'}
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={createAlbum}
          style={{
            border: '1.5px dashed #d9b96a',
            borderRadius: 12,
            padding: 14,
            marginBottom: 14,
            background: '#FFFDF5',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 640,
          }}
        >
          <input
            type="text"
            placeholder="Tên sự kiện (ví dụ: Lễ khai giảng năm học 2026 – 2027)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '8px 10px', border: '1.5px solid #ddd', borderRadius: 7, font: 'inherit', fontSize: 14 }}
          />
          <input
            type="text"
            placeholder="Mô tả ngắn (không bắt buộc)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{ padding: '8px 10px', border: '1.5px solid #ddd', borderRadius: 7, font: 'inherit', fontSize: 14 }}
          />
          <label style={{ fontSize: 13.5, color: 'var(--grey)' }}>
            Ngày diễn ra (không bắt buộc):{' '}
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{ padding: '6px 8px', border: '1.5px solid #ddd', borderRadius: 7, font: 'inherit', fontSize: 14 }}
            />
          </label>
          <div>
            <button type="submit" className="mini-btn">
              Lưu phần sự kiện
            </button>
          </div>
        </form>
      )}

      <div className="filter-row">
        <button
          type="button"
          className={`mini-btn${sel === 'all' ? ' on' : ''}`}
          onClick={() => setSel('all')}
        >
          Tất cả
        </button>
        <button
          type="button"
          className={`mini-btn${sel === 'none' ? ' on' : ''}`}
          onClick={() => setSel('none')}
        >
          Chưa phân loại
        </button>
        {albums.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`mini-btn${sel === a.id ? ' on' : ''}`}
            onClick={() => setSel(a.id)}
          >
            🗂 {a.title}
          </button>
        ))}
      </div>

      {selAlbum && (
        <p style={{ fontSize: 14, lineHeight: 1.7, margin: '4px 0 10px' }}>
          <b>{selAlbum.title}</b>
          {selAlbum.event_date ? ` • Ngày ${selAlbum.event_date}` : ''}
          {selAlbum.description ? (
            <>
              <br />
              {selAlbum.description}
            </>
          ) : null}{' '}
          {(isAdmin || selAlbum.created_by === user.id) && (
            <button
              type="button"
              className="mini-btn btn-danger"
              style={{ marginLeft: 8 }}
              onClick={() => removeAlbum(selAlbum)}
            >
              Xóa phần này
            </button>
          )}
        </p>
      )}

      <label
        className="mini-btn"
        style={{
          cursor: 'pointer',
          display: 'inline-block',
          padding: '9px 16px',
          fontSize: 14,
        }}
      >
        {uploading
          ? 'Đang tải lên...'
          : selAlbum
            ? `⬆ Tải ảnh / video vào “${selAlbum.title}”`
            : '⬆ Tải ảnh / video từ máy'}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={onUpload}
        />
      </label>

      {loading ? (
        <p className="spin">Đang tải thư viện...</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--grey)', fontSize: 14, marginTop: 14 }}>
          {selAlbum
            ? 'Phần sự kiện này chưa có ảnh/video nào. Tải tệp đầu tiên lên nhé.'
            : 'Thư viện đang trống. Tải tệp đầu tiên lên nhé.'}
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
                <b style={{ color: 'var(--ink)' }}>
                  {item.caption || '(không tên)'}
                </b>
                <br />
                {item.kind === 'video' ? 'Video' : 'Ảnh'} •{' '}
                {formatTime(item.created_at)}
              </div>
              <div className="mact">
                <input
                  aria-label="Lời giới thiệu ngắn cho ảnh"
                  placeholder="Lời giới thiệu ngắn cho ảnh..."
                  value={capDraft[item.id] ?? item.caption ?? ''}
                  onChange={(e) =>
                    setCapDraft((d) => ({ ...d, [item.id]: e.target.value }))
                  }
                  style={{
                    padding: '5px 7px',
                    border: '1.5px solid #ddd',
                    borderRadius: 7,
                    font: 'inherit',
                    fontSize: 13,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <button className="mini-btn" onClick={() => saveCaption(item)}>
                  Lưu chú thích
                </button>
                <select
                  aria-label="Chuyển phần sự kiện"
                  value={item.album_id || ''}
                  onChange={(e) =>
                    moveItem(
                      item,
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  style={{
                    padding: '5px 7px',
                    border: '1.5px solid #ddd',
                    borderRadius: 7,
                    font: 'inherit',
                    fontSize: 13,
                    maxWidth: '100%',
                  }}
                >
                  <option value="">Chưa phân loại</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
                <button className="mini-btn" onClick={() => copyUrl(item)}>
                  Sao chép link
                </button>
                {(isAdmin || item.uploaded_by === user.id) && (
                  <button
                    className="mini-btn btn-danger"
                    onClick={() => remove(item)}
                  >
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
