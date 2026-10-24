import { createClient } from './supabase/server';
import { CATEGORY_SLUGS } from './utils';

// Tầng đọc dữ liệu phía server cho các trang công khai.
// Mọi hàm đều chịu lỗi: nếu Supabase chưa có dữ liệu (chưa chạy
// seed-posts.sql) thì trả về mảng rỗng / giá trị mặc định của
// bản thiết kế để trang vẫn hiển thị đẹp.

export const DEFAULT_SETTINGS = {
  school: {
    name: 'TRƯỜNG THPT VÕ TRƯỜNG TOẢN',
    address_line1: 'Địa chỉ: 486 Nguyễn Thị Đặng,',
    address_line2: 'Phường Tân Thới Hiệp, TP. Hồ Chí Minh',
    email: 'pvhai711@gmail.com',
    phone: '(cập nhật trong Admin)',
  },
  banner: {
    text: 'Chuyên đề năm 2024: "Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh về thực hành dân chủ, tăng cường pháp chế, đảm bảo kỷ cương; thu hút nguồn nhân lực chất lượng cao và tâm huyết trong xây dựng Thành phố Hồ Chí Minh văn minh, hiện đại, nghĩa tình"',
  },
  stats: { online: 189, total: 180801 },
};

const POST_COLS =
  'id, title, slug, excerpt, content, cover_url, video_url, status, views, published_at, created_at, category_id, categories(name, slug)';

export async function getCategories() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug) {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

export async function getSettings() {
  const out = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  out.raw = {};
  try {
    const supabase = createClient();
    const { data } = await supabase.from('site_settings').select('key, value');
    (data || []).forEach((row) => {
      out.raw[row.key] = row.value;
      if (row.key === 'school') out.school = { ...out.school, ...row.value };
      if (row.key === 'banner') out.banner = { ...out.banner, ...row.value };
      if (row.key === 'stats') out.stats = { ...out.stats, ...row.value };
    });
  } catch {
    // dùng giá trị mặc định
  }
  return out;
}

// Tìm bài đã xuất bản theo tiêu đề (ô tìm kiếm trên header).
export async function searchPosts(q, limit = 20) {
  const keyword = (q || '').trim();
  if (!keyword) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select(POST_COLS)
      .eq('status', 'published')
      .ilike('title', `%${keyword}%`)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

// Bài đã xuất bản của 1 chuyên mục (theo slug), mới nhất trước.
export async function getPublishedPosts(categorySlug, { limit = 10, offset = 0 } = {}) {
  try {
    const supabase = createClient();
    const cat = await getCategoryBySlug(categorySlug);
    if (!cat) return { posts: [], total: 0 };
    const { data, count, error } = await supabase
      .from('posts')
      .select(POST_COLS, { count: 'exact' })
      .eq('category_id', cat.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return { posts: data || [], total: count || 0 };
  } catch {
    return { posts: [], total: 0 };
  }
}

export async function getPostBySlug(slug) {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select(POST_COLS)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

export async function getRelatedPosts(post, limit = 4) {
  if (!post?.category_id) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select(POST_COLS)
      .eq('category_id', post.category_id)
      .eq('status', 'published')
      .neq('id', post.id)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

// Top bài xem nhiều nhất (mọi chuyên mục) — cho sidebar trang Tin tức.
export async function getTopViewed(limit = 7) {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select(POST_COLS)
      .eq('status', 'published')
      .order('views', { ascending: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

// Các bài có video (cho khối VIDEO ở sidebar) — lấy bài mới nhất có video_url.
export async function getVideoPosts(limit = 1) {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select(POST_COLS)
      .eq('status', 'published')
      .not('video_url', 'is', null)
      .neq('video_url', '')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

export async function getTimelineEvents() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('timeline_events')
      .select('*')
      .order('sort_order', { ascending: true });
    return data || [];
  } catch {
    return [];
  }
}

export { CATEGORY_SLUGS };

// ---------- Thư viện ảnh & video (bảng media / media_albums) ----------
// Lấy danh sách phần sự kiện (nếu thầy chưa chạy file media-albums.sql
// thì trả về mảng rỗng, trang vẫn chạy bình thường).
export async function getMediaAlbums() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media_albums')
      .select('*')
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

// Lấy ảnh/video trong thư viện: lọc theo loại ('image' | 'video'),
// theo phần sự kiện (albumId) hoặc lấy mới nhất (limit).
export async function getMediaItems({ kind = null, albumId = null, limit = 60 } = {}) {
  try {
    const supabase = createClient();
    let q = supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (kind) q = q.eq('kind', kind);
    if (albumId) q = q.eq('album_id', albumId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}
