'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../../../components/admin/AdminShell';
import { ROLE_LABELS, formatTime } from '../../../lib/utils';
import { writeAudit } from '../../../lib/audit';

function genTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `VTT@${s}`;
}

export default function RequestsPage() {
  const { supabase, user, isAdmin } = useAdmin();
  const [requests, setRequests] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [approvedInfo, setApprovedInfo] = useState(null); // {email, password, role}
  const [busyId, setBusyId] = useState(null);
  const [roleChoice, setRoleChoice] = useState({}); // requestId -> role

  async function load() {
    setLoading(true);
    let q = supabase.from('account_requests').select('*').order('created_at', { ascending: false });
    if (!showAll) q = q.eq('status', 'pending');
    const { data } = await q;
    setRequests(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, isAdmin, showAll]);

  async function approve(req) {
    const role = roleChoice[req.id] || req.desired_role;
    const tempPass = genTempPassword();
    setBusyId(req.id);
    setErr('');
    setMsg('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: req.email,
          password: tempPass,
          full_name: req.full_name,
          role,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tạo tài khoản thất bại');

      const { error: upErr } = await supabase
        .from('account_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', req.id);
      if (upErr) throw upErr;

      await writeAudit(supabase, user.id, 'approve_request', `${req.email} — ${role}`);
      setApprovedInfo({ email: req.email, password: tempPass, role });
      load();
    } catch (e2) {
      setErr('Duyệt thất bại: ' + e2.message);
    }
    setBusyId(null);
  }

  async function reject(req) {
    if (!window.confirm(`Từ chối yêu cầu đăng ký của ${req.email}?`)) return;
    const { error } = await supabase
      .from('account_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', req.id);
    if (error) {
      setErr('Từ chối thất bại: ' + error.message);
      return;
    }
    await writeAudit(supabase, user.id, 'reject_request', req.email);
    setMsg(`Đã từ chối yêu cầu của ${req.email}.`);
    load();
  }

  if (!isAdmin) {
    return (
      <>
        <h2>Yêu cầu đăng ký</h2>
        <div className="alert alert-warn">Chỉ Admin chính mới duyệt được yêu cầu đăng ký.</div>
      </>
    );
  }

  return (
    <>
      <h2>Yêu cầu đăng ký chờ duyệt</h2>
      <p className="sub">
        Người dùng tự đăng ký ở trang Đăng ký tài khoản. Yêu cầu chưa được
        duyệt thì <b>không đăng nhập, không đăng bài được</b>. Khi duyệt, hệ
        thống tạo tài khoản bằng <b>mật khẩu tạm</b> — thầy gửi mật khẩu tạm
        cho người đó để họ đăng nhập lần đầu.
      </p>
      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <div className="alert alert-err">{err}</div>}
      {approvedInfo && (
        <div className="alert alert-ok">
          <b>Đã duyệt và tạo tài khoản thành công!</b>
          <br />
          Email đăng nhập: <b>{approvedInfo.email}</b> — Cấp quyền:{' '}
          <b>{ROLE_LABELS[approvedInfo.role]}</b>
          <br />
          Mật khẩu tạm (chỉ hiện lần này, thầy ghi lại và gửi riêng cho người
          đăng ký):
          <br />
          <span className="temp-pass">{approvedInfo.password}</span>
          <br />
          Người đó đăng nhập bằng mật khẩu tạm này và nên đổi mật khẩu ngay
          sau đó.
        </div>
      )}
      <div className="filter-row">
        <button className="mini-btn" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Chỉ hiện yêu cầu chờ duyệt' : 'Hiện cả yêu cầu đã xử lý'}
        </button>
      </div>
      {loading ? (
        <p className="spin">Đang tải...</p>
      ) : requests.length === 0 ? (
        <p style={{ color: 'var(--grey)', fontSize: 14 }}>
          Hiện không có yêu cầu nào {showAll ? '' : 'đang chờ duyệt'}.
        </p>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Người đăng ký</th>
              <th>Xin cấp</th>
              <th>Chọn cấp khi duyệt</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.full_name}</b>
                  <br />
                  <small style={{ color: 'var(--grey)' }}>
                    {r.email}
                    {r.unit ? ` • ${r.unit}` : ''}
                    <br />
                    Đăng ký: {formatTime(r.created_at)}
                    {r.note ? (
                      <>
                        <br />
                        Ghi chú: {r.note}
                      </>
                    ) : null}
                  </small>
                </td>
                <td>
                  <span className={`bdg ${r.desired_role === 'editor' ? 'bdg-editor' : 'bdg-ctv'}`}>
                    {ROLE_LABELS[r.desired_role]}
                  </span>
                </td>
                <td>
                  {r.status === 'pending' ? (
                    <select
                      className="role-sel"
                      value={roleChoice[r.id] || r.desired_role}
                      onChange={(e) =>
                        setRoleChoice((s) => ({ ...s, [r.id]: e.target.value }))
                      }
                    >
                      <option value="editor">Biên tập viên</option>
                      <option value="ctv">Cộng tác viên</option>
                    </select>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {r.status === 'pending' && <span className="bdg bdg-pen">Chờ duyệt</span>}
                  {r.status === 'approved' && <span className="bdg bdg-pub">Đã duyệt</span>}
                  {r.status === 'rejected' && (
                    <span className="bdg" style={{ background: '#FDECEC', color: '#8f1216' }}>
                      Đã từ chối
                    </span>
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {r.status === 'pending' && (
                    <>
                      <button
                        className="mini-btn"
                        disabled={busyId === r.id}
                        onClick={() => approve(r)}
                      >
                        {busyId === r.id ? 'Đang duyệt...' : '✔ Duyệt'}
                      </button>
                      <button className="mini-btn btn-danger" onClick={() => reject(r)}>
                        Từ chối
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
