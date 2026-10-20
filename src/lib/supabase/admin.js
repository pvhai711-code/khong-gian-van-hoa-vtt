import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ⚠️ Client quản trị dùng khóa BÍ MẬT (service_role / secret key).
// CHỈ được dùng phía server (API routes), TUYỆT ĐỐI không import vào
// component chạy phía trình duyệt. Nếu chưa cấu hình khóa bí mật
// (biến SUPABASE_SERVICE_ROLE_KEY trên Vercel), trả về null để
// nơi gọi xử lý thông báo phù hợp.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
