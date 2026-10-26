import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';
import { createClient } from '../../../lib/supabase/server';

// Ghi nhận 1 phiên truy cập. Mỗi trình duyệt có 1 mã phiên (cookie vtt_sid).
// - Đang online = số phiên còn hoạt động trong 5 phút gần nhất.
// - Tổng số truy cập tăng 1 khi phiên mới xuất hiện, hoặc khi phiên cũ quay lại
//   sau hơn 30 phút không hoạt động (cùng 1 người lướt nhiều trang trong 30 phút
//   chỉ tính 1 lượt, nên bấm F5 liên tục không làm số tăng ảo).
// Ưu tiên dùng khóa service_role (không cho ghi công khai); nếu chưa cấu hình
// khóa thì dùng khóa anon + RLS của bảng visitor_sessions. Gặp lỗi thì bỏ qua
// lặng lẽ để không bao giờ làm hỏng trang.
const VISIT_GAP_MS = 30 * 60 * 1000;

export async function POST() {
  try {
    const jar = cookies();
    let sid = jar.get('vtt_sid')?.value;
    if (!sid) {
      sid = crypto.randomUUID();
      jar.set('vtt_sid', sid, {
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax',
      });
    }

    const supabase = createAdminClient() || createClient();
    const now = new Date();
    const { data: row } = await supabase
      .from('visitor_sessions')
      .select('last_seen, visits')
      .eq('sid', sid)
      .maybeSingle();

    if (!row) {
      await supabase.from('visitor_sessions').insert({
        sid,
        last_seen: now.toISOString(),
        visits: 1,
      });
    } else if (
      new Date(row.last_seen).getTime() <
      now.getTime() - VISIT_GAP_MS
    ) {
      await supabase
        .from('visitor_sessions')
        .update({
          last_seen: now.toISOString(),
          visits: (row.visits || 0) + 1,
        })
        .eq('sid', sid);
    } else {
      await supabase
        .from('visitor_sessions')
        .update({ last_seen: now.toISOString() })
        .eq('sid', sid);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
