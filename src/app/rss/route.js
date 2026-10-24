import { createClient } from '../../lib/supabase/server';

// Kênh RSS: 20 bài viết mới nhất đã đăng — cho các trình đọc tin (Feedly...)
// và các cổng thông tin khác lấy tin tự động. Địa chỉ: /rss
export const dynamic = 'force-dynamic';

const SITE = 'https://khonggianvanhoahochiminh-thptvtt.vercel.app';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let items = '';
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select('title, slug, excerpt, published_at, created_at, categories(name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(20);
    items = (data || [])
      .map((p) => {
        const link = `${SITE}/bai-viet/${p.slug}`;
        const date = new Date(p.published_at || p.created_at).toUTCString();
        return [
          '    <item>',
          `      <title>${esc(p.title)}</title>`,
          `      <link>${link}</link>`,
          `      <guid isPermaLink="true">${link}</guid>`,
          `      <pubDate>${date}</pubDate>`,
          `      <category>${esc(p.categories?.name || '')}</category>`,
          `      <description>${esc(p.excerpt || '')}</description>`,
          '    </item>',
        ].join('\n');
      })
      .join('\n');
  } catch {
    items = '';
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    '    <title>Không gian văn hóa Hồ Chí Minh — Trường THPT Võ Trường Toản</title>',
    `    <link>${SITE}</link>`,
    '    <description>Tin tức và bài viết mới nhất từ Không gian văn hóa Hồ Chí Minh của Trường THPT Võ Trường Toản.</description>',
    '    <language>vi-vn</language>',
    items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
