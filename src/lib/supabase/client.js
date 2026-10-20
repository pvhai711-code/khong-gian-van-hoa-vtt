import { createBrowserClient } from '@supabase/ssr';

// Client dùng phía trình duyệt (đăng nhập, khu vực Admin...).
// Chỉ dùng khóa công khai (publishable/anon) — an toàn vì dữ liệu
// đã được bảo vệ bằng Row Level Security trên Supabase.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
