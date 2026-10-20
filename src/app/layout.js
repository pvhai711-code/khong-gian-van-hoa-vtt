import './globals.css';
import './extras.css';
import { createClient } from '../lib/supabase/server';
import { getCategories, getSettings } from '../lib/data';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import BackToTop from '../components/BackToTop';

// Luôn render động: dữ liệu (bài viết, cài đặt) lấy trực tiếp từ Supabase
// ở mỗi lần truy cập nên trang chủ luôn mới và bản build không phụ thuộc
// việc kết nối Supabase lúc biên dịch.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Không gian văn hóa Hồ Chí Minh — Trường THPT Võ Trường Toản',
  description:
    'Không gian văn hóa Hồ Chí Minh của Trường THPT Võ Trường Toản — nơi thầy và trò cùng tìm hiểu cuộc đời, sự nghiệp, tư tưởng và đạo đức của Bác, học tập và làm theo lời Bác mỗi ngày.',
};

export default async function RootLayout({ children }) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSettings(),
  ]);

  let isLoggedIn = false;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  } catch {
    isLoggedIn = false;
  }

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,700;0,800;0,900;1,400&family=Noto+Serif:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader categories={categories} isLoggedIn={isLoggedIn} />
        {children}
        <SiteFooter settings={settings} />
        <BackToTop />
      </body>
    </html>
  );
}
