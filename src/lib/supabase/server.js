import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Client dùng trong Server Components / Route Handlers (đọc dữ liệu công khai
// và phiên đăng nhập từ cookie).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Được gọi từ Server Component — bỏ qua, middleware sẽ lo việc
            // làm mới phiên đăng nhập.
          }
        },
      },
    }
  );
}
