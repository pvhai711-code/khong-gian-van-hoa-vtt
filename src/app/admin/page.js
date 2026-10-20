'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '../../components/admin/AdminShell';
import { formatTime, STATUS_LABELS } from '../../lib/utils';

export default function AdminDashboard() {
  const { supabase, isAdmin, user } = useAdmin();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [pendingReq, setPendingReq] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const postsQ = supabase
        .from('posts')
        .select('id, status, views, title, slug, created_at, author_id');
      const { data: posts } = await postsQ;
      const list = posts || [];
      setStats({
        total: list.length,
        published: list.filter((p) => p.status === 'published').length,
        pending: list.filter((p) => p.status === 'pending').length,
        views: list.reduce((s, p) => s + (p.views || 0), 0),
      });
      setRecent(
        [...list]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
      );
      if (isAdmin) {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        setStats((s) => ({ ...s, accounts: count || 0 }));
        const { count: rc } = await supabase
          .from('account_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');
        setPendingReq(rc || 0);
      }
      setLoading(false);
    })();
  }, [supabase, isAdmin]);

  return (
    <>
      <h2>Tổng quan</h2>
      <p className="sub">
        Số liệu lấy trực tiếp từ cơ sở dữ liệu Supabase của website.
      </p>
      {loading ? (
        <p className="spin">Đang tải số liệu...</p>
      ) : (
        <>
          <div className="stat-cards">
            <div className="stat">
              <b>{stats.total}</b>
              <span>Tổng bài viết</span>
            </div>
            <div className="stat">
              <b>{stats.published}</b>
              <span>Bài đã đăng</span>
            </div>
            <div className="stat">
              <b>{stats.pending}</b>
              <span>Bài chờ duyệt</span>
            </div>
            <div className="stat">
              <b>{stats.views.toLocaleString('vi-VN')}</b>
              <span>Tổng lượt xem bài</span>
            </div>
            {isAdmin && (
              <div className="stat">
                <b>{stats.accounts ?? '—'}</b>
                <span>Tài khoản quản trị</span>
              </div>
            )}
          </div>

          {isAdmin && pendingReq > 0 && (
            <div className="alert alert-warn">
              Có <b>{pendingReq} yêu cầu đăng ký tài khoản</b> đang chờ duyệt —
              vào mục{' '}
              <Link href="/admin/yeu-cau" style={{ fontWeight: 800 }}>
                Yêu cầu đăng ký
              </Link>{' '}
              để duyệt hoặc từ chối.
            </div>
          )}
          {stats.pending > 0 && (
            <div className="alert alert-warn">
              Có <b>{stats.pending} bài viết chờ duyệt</b> — vào mục{' '}
              <Link href="/admin/bai-viet" style={{ fontWeight: 800 }}>
                Quản lý bài viết
              </Link>{' '}
              để xem{isAdmin ? ' và duyệt' : ''}.
            </div>
          )}

          <h3 style={{ marginBottom: 8 }}>Bài viết mới nhất</h3>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--grey)', fontSize: 14 }}>
              Chưa có bài viết nào. Bấm “Đăng bài mới” để bắt đầu.
            </p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link
                        href={`/admin/bai-viet/${p.id}`}
                        style={{ fontWeight: 700 }}
                      >
                        {p.title}
                      </Link>
                      {p.author_id === user.id && (
                        <small style={{ color: 'var(--grey)' }}> (bài của tôi)</small>
                      )}
                    </td>
                    <td>
                      <span
                        className={`bdg ${p.status === 'published' ? 'bdg-pub' : 'bdg-pen'}`}
                      >
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td>{formatTime(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </>
  );
}
