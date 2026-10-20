import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';

// Tăng lượt xem bài viết. Khách không có quyền sửa bảng posts nên
// việc này phải qua server dùng khóa bí mật (service_role). Nếu
// chưa cấu hình khóa bí mật, bỏ qua lặng lẽ (trang vẫn chạy bình thường).
export async function POST(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ ok: false }, { status: 400 });

    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ ok: false, reason: 'no-service-key' });

    const { data } = await admin
      .from('posts')
      .select('views')
      .eq('id', id)
      .maybeSingle();
    if (!data) return NextResponse.json({ ok: false }, { status: 404 });

    await admin
      .from('posts')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
