'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from './AdminShell';
import { slugify } from '../../lib/utils';
import { writeAudit } from '../../lib/audit';

// Trình soạn bài viết: biểu mẫu + thanh công cụ định dạng cơ bản
// (chèn thẻ HTML vào textarea) + xem trước trực tiếp.
// Nội dung lưu ở dạng HTML trong cột posts.content.
export default function PostForm({ initial = null }) {
  const { supabase, user, profile, role } = useAdmin();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    category_id: initial?.category_id || '',
    excerpt: initial?.excerpt || '',
    content: initial?.content || '',
    cover_url: initial?.cover_url || '',
    video_url: initial?.video_url || '',
    status: initial?.status || (role === 'ctv' ? 'pending' : 'published'),
  });
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [preview, setPreview] = useState(false);
  const bodyRef = useRef(null);

  const canPublish = role === 'admin' || role === 'editor';

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug, is_external')
      .order('sort_order')
      .then(({ data }) => {
        const list = (data || []).filter((c) => !c.is_external);
        setCategories(list);
        if (!initial && list.length) {
          const news = list.find(
            (c) => c.slug === 'tin-tuc-khong-gian-van-hoa'
          );
          setForm((f) => ({ ...f, category_id: f.category_id || (news || list[0]).id }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === 'title' && !slugTouched) next.slug = slugify(v);
      return next;
    });
  };

  // Chèn thẻ HTML quanh đoạn đang chọn trong ô nội dung
  function wrapTag(before, after = '') {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const selected = value.slice(s, e) || 'văn bản';
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    setForm((f) => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  }

  async function uploadToStorage(file, bucket) {
    const safe = file.name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-');
    const path = `${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    // Ghi vào thư viện media để dùng lại
    await supabase.from('media').insert({
      url: data.publicUrl,
      path: `${bucket}/${path}`,
      kind: bucket === 'videos' ? 'video' : 'image',
      caption: file.name,
      uploaded_by: user.id,
    });
    return data.publicUrl;
  }

  async function onCoverFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('cover');
    setError('');
    try {
      const url = await uploadToStorage(file, 'images');
      setForm((f) => ({ ...f, cover_url: url }));
    } catch (err) {
      setError('Tải ảnh bìa thất bại: ' + err.message);
    }
    setUploading('');
    e.target.value = '';
  }

  async function onInlineImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('inline');
    setError('');
    try {
      const url = await uploadToStorage(file, 'images');
      wrapTag(`<img src="${url}" alt="Ảnh minh họa">`, '');
    } catch (err) {
      setError('Tải ảnh vào bài thất bại: ' + err.message);
    }
    setUploading('');
    e.target.value = '';
  }

  async function ensureUniqueSlug(base, selfId) {
    let slug = base || 'bai-viet';
    let n = 1;
    for (;;) {
      const { data } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .limit(1);
      const clash = (data || []).find((r) => r.id !== selfId);
      if (!clash) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setOkMsg('');
    if (!form.category_id) {
      setError('Thầy/cô chọn chuyên mục cho bài viết.');
      return;
    }
    let status = form.status;
    if (!canPublish && status === 'published') status = 'pending';
    setSaving(true);
    try {
      const slug = await ensureUniqueSlug(
        slugify(form.slug || form.title),
        initial?.id
      );
      const payload = {
        title: form.title.trim(),
        slug,
        category_id: Number(form.category_id),
        excerpt: form.excerpt.trim() || null,
        content: form.content || null,
        cover_url: form.cover_url.trim() || null,
        video_url: form.video_url.trim() || null,
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === 'published' && initial?.status !== 'published') {
        payload.published_at = new Date().toISOString();
      }
      if (initial) {
        const { error: upErr } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', initial.id);
        if (upErr) throw upErr;
        await writeAudit(supabase, user.id, 'update_post', payload.title);
        setOkMsg('Đã lưu thay đổi bài viết.');
      } else {
        payload.author_id = user.id;
        if (status === 'published') payload.published_at = new Date().toISOString();
        const { error: insErr } = await supabase.from('posts').insert(payload);
        if (insErr) throw insErr;
        await writeAudit(supabase, user.id, 'create_post', payload.title);
        setOkMsg(
          status === 'published'
            ? 'Đã đăng bài — bài đã hiện trên website.'
            : status === 'pending'
              ? 'Đã gửi bài — bài đang chờ Admin chính duyệt.'
              : 'Đã lưu bản nháp.'
        );
      }
      router.push('/admin/bai-viet');
      router.refresh();
    } catch (err) {
      setError('Không lưu được bài: ' + err.message);
    }
    setSaving(false);
  }

  const statusOptions = canPublish
    ? [
        { v: 'published', t: 'Xuất bản ngay' },
        { v: 'pending', t: 'Chờ duyệt' },
        { v: 'draft', t: 'Bản nháp (chưa hiện)' },
      ]
    : [
        { v: 'pending', t: 'Gửi chờ Admin duyệt' },
        { v: 'draft', t: 'Bản nháp (chưa hiện)' },
      ];
  if (
    initial?.status &&
    !statusOptions.some((o) => o.v === initial.status)
  ) {
    statusOptions.unshift({ v: initial.status, t: `Giữ nguyên (${initial.status})` });
  }

  return (
    <form className="frm" onSubmit={onSubmit}>
      {error && <div className="alert alert-err">{error}</div>}
      {okMsg && <div className="alert alert-ok">{okMsg}</div>}

      <label>Tiêu đề bài viết *</label>
      <input required value={form.title} onChange={set('title')} placeholder="Nhập tiêu đề..." />

      <label>Đường dẫn (slug)</label>
      <input
        value={form.slug}
        onChange={(e) => {
          setSlugTouched(true);
          set('slug')(e);
        }}
        placeholder="tu-dong-tao-tu-tieu-de"
      />

      <label>Chuyên mục *</label>
      <select value={form.category_id} onChange={set('category_id')} required>
        <option value="" disabled>
          — Chọn chuyên mục —
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label>Tóm tắt</label>
      <textarea rows={2} value={form.excerpt} onChange={set('excerpt')} placeholder="1–2 câu tóm tắt nội dung..." />

      <label>Ảnh đại diện (ảnh bìa)</label>
      <div className="cover-row">
        <div className="cover-preview">
          {form.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.cover_url} alt="Ảnh bìa" />
          ) : (
            <div className="cover-ph">
              <span className="star">★</span>
              <span className="cat">Chưa có ảnh — web sẽ hiện khung thay thế</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <input
            value={form.cover_url}
            onChange={set('cover_url')}
            placeholder="Dán link ảnh, hoặc tải ảnh lên →"
          />
          <div style={{ marginTop: 8 }}>
            <label className="mini-btn" style={{ cursor: 'pointer', display: 'inline-block' }}>
              {uploading === 'cover' ? 'Đang tải...' : '⬆ Tải ảnh bìa từ máy'}
              <input type="file" accept="image/*" hidden onChange={onCoverFile} />
            </label>
          </div>
        </div>
      </div>

      <label>Link video (YouTube hoặc file .mp4 — không bắt buộc)</label>
      <input value={form.video_url} onChange={set('video_url')} placeholder="https://www.youtube.com/watch?v=..." />

      <label>Nội dung bài viết</label>
      <div className="editor-bar">
        <button type="button" onClick={() => wrapTag('<strong>', '</strong>')}><b>B</b> Đậm</button>
        <button type="button" onClick={() => wrapTag('<em>', '</em>')}><i>I</i> Nghiêng</button>
        <button type="button" onClick={() => wrapTag('<u>', '</u>')}><u>U</u> Gạch chân</button>
        <button type="button" onClick={() => wrapTag('<h3>', '</h3>')}>Tiêu đề nhỏ</button>
        <button type="button" onClick={() => wrapTag('<blockquote>', '</blockquote>')}>Trích dẫn</button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Nhập địa chỉ liên kết (https://...)');
            if (url) wrapTag(`<a href="${url}" target="_blank" rel="noopener">`, '</a>');
          }}
        >
          🔗 Liên kết
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Nhập link ảnh (https://...)');
            if (url) wrapTag(`<img src="${url}" alt="Ảnh minh họa">`, '');
          }}
        >
          🖼 Ảnh theo link
        </button>
        <label className="mini-btn" style={{ cursor: 'pointer' }}>
          {uploading === 'inline' ? 'Đang tải...' : '⬆ Tải ảnh vào bài'}
          <input type="file" accept="image/*" hidden onChange={onInlineImage} />
        </label>
        <button type="button" onClick={() => setPreview((v) => !v)}>
          {preview ? 'Ẩn xem trước' : '👁 Xem trước'}
        </button>
      </div>
      <textarea
        ref={bodyRef}
        rows={12}
        value={form.content}
        onChange={set('content')}
        placeholder="Soạn nội dung tại đây. Dùng các nút phía trên để in đậm, chèn ảnh, trích dẫn... (nội dung lưu dạng HTML)"
      />
      {preview && (
        <div
          className="editor-preview article-body"
          dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#999">(Chưa có nội dung)</p>' }}
        />
      )}

      <label>Trạng thái</label>
      <select value={form.status} onChange={set('status')}>
        {statusOptions.map((o) => (
          <option key={o.v} value={o.v}>
            {o.t}
          </option>
        ))}
      </select>
      {!canPublish && (
        <p style={{ fontSize: 13, color: 'var(--grey)', marginTop: 6 }}>
          Tài khoản Cộng tác viên: bài gửi lên sẽ ở trạng thái <b>chờ duyệt</b>,
          Admin chính duyệt xong mới hiện trên website.
        </p>
      )}

      <button className="btn-full" type="submit" disabled={saving}>
        {saving ? 'Đang lưu...' : initial ? 'Lưu bài viết' : 'Đăng bài'}
      </button>
    </form>
  );
}
