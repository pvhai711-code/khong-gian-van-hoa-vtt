'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { ROLE_LABELS } from '../../lib/utils';

const AdminContext = createContext(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin phải dùng bên trong AdminShell');
  return ctx;
}

const NAV = [
  { href: '/admin', label: 'Tổng quan', icon: '▦', exact: true },
  { href: '/admin/dang-bai', label: 'Đăng bài mới', icon: '✎' },
  { href: '/admin/bai-viet', label: 'Quản lý bài viết', icon: '☰' },
  { href: '/admin/media', label: 'Thư viện media', icon: '🖼' },
  { href: '/admin/chuyen-muc', label: 'Chuyên mục', icon: '🗂', roles: ['admin'] },
  { href: '/admin/moc-thoi-gian', label: 'Mốc thời gian', icon: '🕰', roles: ['admin', 'editor'] },
  { href: '/admin/tai-khoan', label: 'Quản lý tài khoản', icon: '👥', roles: ['admin'] },
  { href: '/admin/yeu-cau', label: 'Yêu cầu đăng ký', icon: '📩', roles: ['admin'], badge: 'requests' },
  { href: '/admin/cai-dat', label: 'Cài đặt trang', icon: '⚙', roles: ['admin'] },
];

export default function AdminShell({ user, profile, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [pendingRequests, setPendingRequests] = useState(0);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from('account_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingRequests(count || 0));
  }, [supabase, isAdmin, pathname]);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const ctxValue = { user, profile, supabase, isAdmin, role: profile?.role };

  return (
    <AdminContext.Provider value={ctxValue}>
      <main>
        <section className="sec wrap" style={{ paddingTop: 22 }}>
          <div className="crumb">
            <Link href="/">Trang chủ</Link> / <b>Khu vực Admin</b>
          </div>
          <div className="adm">
            <aside className="adm-side">
              <div className="adm-user">
                <b>{profile?.full_name || user?.email}</b>
                <small>
                  {ROLE_LABELS[profile?.role] || profile?.role} • {user?.email}
                </small>
              </div>
              {NAV.filter(
                (item) => !item.roles || item.roles.includes(profile?.role)
              ).map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? 'on' : undefined}
                  >
                    {item.icon} &nbsp;{item.label}
                    {item.badge === 'requests' && pendingRequests > 0 && (
                      <>
                        {' '}
                        <span className="bdg bdg-pen">
                          {pendingRequests} chờ duyệt
                        </span>
                      </>
                    )}
                  </Link>
                );
              })}
              {!isAdmin && (
                <button disabled title="Chỉ Admin chính mới sửa được cài đặt trang">
                  ⚙ &nbsp;Cài đặt trang 🔒
                </button>
              )}
              <button onClick={logout}>↩ &nbsp;Đăng xuất</button>
            </aside>
            <div className="adm-main">{children}</div>
          </div>
        </section>
      </main>
    </AdminContext.Provider>
  );
}
