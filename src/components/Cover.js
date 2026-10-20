// Ảnh bìa của bài viết. Nếu bài chưa có ảnh bìa (cover_url trống),
// hiển thị khối thay thế được thiết kế sẵn: nền kem–đỏ, ngôi sao vàng
// và tên chuyên mục — đúng tinh thần bản thiết kế đã duyệt.
export function CoverPlaceholder({ categoryName, variant = '' }) {
  return (
    <div className={`cover-ph ${variant}`} aria-hidden="true">
      <span className="star">★</span>
      <span className="cat">{categoryName || 'Không gian văn hóa Hồ Chí Minh'}</span>
    </div>
  );
}

// variant: 'round' (ảnh tròn ở Tin mới), 'sm' (ảnh nhỏ danh sách), '' (thường)
export default function Cover({ post, variant = '' }) {
  const catName = post?.categories?.name || '';
  if (post?.cover_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={post.cover_url} alt={post.title || 'Ảnh bài viết'} loading="lazy" />;
  }
  return <CoverPlaceholder categoryName={catName} variant={variant} />;
}
