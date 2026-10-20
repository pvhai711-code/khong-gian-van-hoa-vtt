import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { createAdminClient } from '../../../../lib/supabase/admin';

// API quản lý tài khoản — CHỈ Admin chính gọi được.
// Việc tạo/xóa tài khoản đăng nhập (Supabase Auth) bắt buộc dùng
// khóa bí mật service_role phía server.

// Kiểm tra người gọi có phải Admin chính đang hoạt động không.
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Chưa đăng nhập', status: 401 };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
    return { error: 'Chỉ Admin chính mới thực hiện được thao tác này', status: 403 };
  }
  return { user };
}

function needServiceKey() {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          'Server chưa được cấu hình khóa bí mật SUPABASE_SERVICE_ROLE_KEY. Thầy vào Vercel > Settings > Environment Variables, thêm khóa Secret (service_role) của Supabase rồi Deploy lại.',
      },
      { status: 500 }
    );
  }
  return admin;
}

// POST: tạo tài khoản đăng nhập + hồ sơ phân quyền
export async function POST(request) {
  const gate = await requireAdmin();
  if (gate.error)
    return NextResponse.json({ error: gate.error }, { status: gate.status });

  const admin = needServiceKey();
  if (admin instanceof NextResponse) return admin;

  try {
    const { email, password, full_name, role } = await request.json();
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Thiếu email, mật khẩu hoặc cấp quyền' },
        { status: 400 }
      );
    }
    if (!['admin', 'editor', 'ctv'].includes(role)) {
      return NextResponse.json({ error: 'Cấp quyền không hợp lệ' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: String(email).trim().toLowerCase(),
        password: String(password),
        email_confirm: true,
        user_metadata: { full_name: full_name || '' },
      });
    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    const { error: profErr } = await admin.from('profiles').insert({
      id: created.user.id,
      email: created.user.email,
      full_name: full_name || null,
      role,
      status: 'active',
    });
    if (profErr) {
      // Gỡ tài khoản Auth vừa tạo để tránh mồ côi
      await admin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: profErr.message }, { status: 400 });
    }

    await admin.from('audit_logs').insert({
      actor_id: gate.user.id,
      action: 'create_account',
      detail: `${created.user.email} — ${role}`,
    });

    return NextResponse.json({ ok: true, user: { id: created.user.id, email: created.user.email } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

// DELETE: xóa tài khoản (hồ sơ profiles tự xóa theo khóa ngoại cascade)
export async function DELETE(request) {
  const gate = await requireAdmin();
  if (gate.error)
    return NextResponse.json({ error: gate.error }, { status: gate.status });

  const admin = needServiceKey();
  if (admin instanceof NextResponse) return admin;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });
    if (id === gate.user.id) {
      return NextResponse.json(
        { error: 'Không thể tự xóa tài khoản Admin chính đang đăng nhập' },
        { status: 400 }
      );
    }
    const { error: delErr } = await admin.auth.admin.deleteUser(id);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }
    await admin.from('audit_logs').insert({
      actor_id: gate.user.id,
      action: 'delete_account',
      detail: id,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
