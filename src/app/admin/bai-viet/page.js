'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '../../../components/admin/AdminShell';
import { formatTime, STATUS_LABELS } from '../../../lib/utils';
import { writeAudit } from '../../../lib/audit';

const FILTERS = [
  { v: 'all', t: 'Tất cả' },
  { v: 'published', t: 'Đã đăng' },
  { v: 'pending', t: 'Chờ duyệt' },
  { v: 'draft', t: 'Bản nháp' },
];

export default function AdminPostsPage() {
  const { supabase, user, isAdmin } = useAdmin();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, status, views, created_at, published_at, author_id, categories(name)')
      .order('created_at', { ascending: false });
    let list = data || [];
    // Tài khoản cấp thấp chỉ quản lý bài của mình (Admin thấy tất cả)
    if (!isAdmin) list = list.filter((p) => p.author_id === user.id);
    setPosts(list);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, isAdmin, user.id]);

  async function approve(post) {
    const { error } = await supabase
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id);
    if (error) {
      setMsg('Duyệt bài thất bại: ' + error.message);
      return;
    }
    await writeAudit(supabase, user.id, 'approve_post', post.title);
    setMsg(`Đã duyệt đăng bài “${post.title}”.`);
    load();
  }

  async function remove(post) {
    if (!window.confirm(`Xóa hẳn bài “${post.title}”? Thao tác này không hoàn tác được.`)) return;
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) {
      setMsg('Xóa bài thất bại: ' + error.message);
      return;
    }
    await writeAudit(supabase, user.id, 'delete_post', post.title);
    setMsg(`Đã xóa bài “${post.title}”.`);
    load();
  }

  const shown = posts.filter((p) => filter === 'all' || p.status === filter);

  return (
    <>
      <h2>Quản lý bài viết</h2>
      <p className="sub">
        {isAdmin
          ? 'Admin chính thấy, duyệt và xóa được mọi bài viết.'
          : 'Thầy/cô chỉ quản lý được bài viết của mình. Bài của Cộng tác viên cần Admin chính duyệt mới được đăng.'}
      </p>
      {msg && <div className="alert alert-ok">{msg}</div>}
      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.v}
            className={`mini-btn${filter === f.v ? ' on' : ''}`}
            onClick={() => setFilter(f.v)}
          >
            {f.t} ({f.v === 'all' ? posts.length : posts.filter((p) => p.status === f.v).length})
          </button>
        ))}
        <Link href="/admin/dang-bai" className="mini-btn" style={{ marginLeft: 'auto' }}>
          ✎ Đăng bài mới
        </Link>
      </div>
      {loading ? (
        <p className="spin">Đang tải danh sách bài viết...</p>
      ) : shown.length === 0 ? (
        <p style={{ color: 'var(--grey)', fontSize: 14 }}>Không có bài viết nào ở mục này.</p>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Chuyên mục</th>
              <th>Trạng thái</th>
              <th>Lượt xem</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{p.title}</b>
                  <br />
                  <small style={{ color: 'var(--grey)' }}>
                    {formatTime(p.published_at || p.created_at)}
                  </small>
                </td>
                <td>{p.categories?.name || '—'}</td>
                <td>
                  <span className={`bdg ${p.status === 'published' ? 'bdg-pub' : 'bdg-pen'}`}>
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </td>
                <td>{p.views || 0}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {p.status === 'published' && (
                    <Link className="mini-btn" href={`/bai-viet/${p.slug}`} target="_blank">
                      Xem
                    </Link>
                  )}
                  <Link className="mini-btn" href={`/admin/bai-viet/${p.id}`}>
                    Sửa
                  </Link>
                  {isAdmin && p.status === 'pending' && (
                    <button className="mini-btn" onClick={() => approve(p)}>
                      ✔ Duyệt
                    </button>
                  )}
                  <button className="mini-btn btn-danger" onClick={() => remove(p)}>
                    Xóa
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
