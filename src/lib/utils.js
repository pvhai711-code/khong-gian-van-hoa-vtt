// Các hàm tiện ích dùng chung.

// Định dạng thời gian kiểu "10:45 | 03/09/2026" như trang mẫu.
export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value || '';
  return `${get('hour')}:${get('minute')} | ${get('day')}/${get('month')}/${get('year')}`;
}

// Tạo slug không dấu từ tiêu đề tiếng Việt.
export function slugify(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

// Đường dẫn của một chuyên mục trên website.
export function categoryHref(cat) {
  if (!cat) return '/';
  if (cat.is_external && cat.external_url) return cat.external_url;
  switch (cat.slug) {
    case 'trang-chu-khong-gian-van-hoa':
      return '/';
    case 'tin-tuc-khong-gian-van-hoa':
      return '/tin-tuc';
    case 'cuoc-doi-su-nghiep':
      return '/cuoc-doi';
    default:
      return `/chuyen-muc/${cat.slug}`;
  }
}

export const CATEGORY_SLUGS = {
  home: 'trang-chu-khong-gian-van-hoa',
  news: 'tin-tuc-khong-gian-van-hoa',
  life: 'cuoc-doi-su-nghiep',
  examples: 'hoc-va-lam-theo-loi-bac',
  ideology: 'tu-tuong-dao-duc',
  world: 'hcm-va-the-gioi',
  museum: 'tham-quan-bao-tang',
};

export const ROLE_LABELS = {
  admin: 'Admin chính',
  editor: 'Biên tập viên',
  ctv: 'Cộng tác viên',
};

export const STATUS_LABELS = {
  published: 'Đã đăng',
  pending: 'Chờ duyệt',
  draft: 'Bản nháp',
};
