import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

// Ghi nhận 1 phiên truy cập. Mỗi trình duyệt có 1 mã phiên (cookie vtt_sid).
// - Đang online = số phiên còn hoạt động trong 5 phút gần nhất.
// - Tổng số truy cập tăng 1 khi phiên mới xuất hiện, hoặc khi phiên cũ quay lại
//   sau hơn 30 phút không hoạt động (cùng 1 người lướt nhiều trang trong 30 phút
//   chỉ tính 1 lượt, nên bấm F5 liên tục không làm số tăng ảo).
// CHỈ dùng khóa anon (không dùng khóa service_role): bảng visitor_sessions đã có
// RLS cho phép anon đọc/ghi, còn khóa service_role trên Vercel từng làm code cũ
// trả "ok" giả trong khi không lưu được dòng nào (lỗi lưu bị bỏ qua). Lỗi lưu giờ
// được trả về 500 + ghi nhật ký máy chủ để không bao giờ "thành công giả" nữa.
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

    const supabase = createClient();
    const now = new Date();
    const { data: row } = await supabase
      .from('visitor_sessions')
      .select('last_seen, visits')
      .eq('sid', sid)
      .maybeSingle();

    let dbError = null;
    if (!row) {
      const { error } = await supabase.from('visitor_sessions').insert({
        sid,
        last_seen: now.toISOString(),
        visits: 1,
      });
      dbError = error;
    } else if (
      new Date(row.last_seen).getTime() <
      now.getTime() - VISIT_GAP_MS
    ) {
      const { error } = await supabase
        .from('visitor_sessions')
        .update({
          last_seen: now.toISOString(),
          visits: (row.visits || 0) + 1,
        })
        .eq('sid', sid);
      dbError = error;
    } else {
      const { error } = await supabase
        .from('visitor_sessions')
        .update({ last_seen: now.toISOString() })
        .eq('sid', sid);
      dbError = error;
    }
    if (dbError) {
      console.error('[track] luu phien that bai:', dbError.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
