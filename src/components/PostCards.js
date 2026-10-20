import Link from 'next/link';
import Cover from './Cover';
import { formatTime } from '../lib/utils';

const articleHref = (post) => `/bai-viet/${post.slug}`;

// Ô tin tròn ở lưới 2×2 mục TIN MỚI (trang chủ)
export function NewsRoundItem({ post }) {
  return (
    <article className="item">
      <div className="thumb">
        <Cover post={post} variant="round" />
      </div>
      <div>
        <time>{formatTime(post.published_at || post.created_at)}</time>
        <h4>
          <Link href={articleHref(post)}>{post.title}</Link>
        </h4>
        <Link className="more" href={articleHref(post)}>
          Xem chi tiết →
        </Link>
      </div>
    </article>
  );
}

// Thẻ bài ở mục GƯƠNG ĐIỂN HÌNH (trang chủ)
export function CardItem({ post }) {
  return (
    <article className="card">
      <div className="ph">
        <Cover post={post} />
      </div>
      <div className="bd">
        <time>{formatTime(post.published_at || post.created_at)}</time>
        <h4>
          <Link href={articleHref(post)}>{post.title}</Link>
        </h4>
        {post.excerpt && <p>{post.excerpt}</p>}
        <Link className="more" href={articleHref(post)}>
          Xem chi tiết →
        </Link>
      </div>
    </article>
  );
}

// Bài nổi bật lớn (Tư tưởng / Thế giới / trang chuyên mục / Tin tức)
export function FeaturePost({ post, alt = false }) {
  return (
    <article className="feat">
      <div className={`ph-lg${alt ? ' alt' : ''}`}>
        <Cover post={post} />
      </div>
      <time>{formatTime(post.published_at || post.created_at)}</time>
      <h4>
        <Link href={articleHref(post)}>{post.title}</Link>
      </h4>
      {post.excerpt && <p>{post.excerpt}</p>}
      <Link className="more" href={articleHref(post)}>
        Xem chi tiết →
      </Link>
    </article>
  );
}

// Bài nhỏ trong danh sách bên cạnh bài nổi bật
export function SmallItem({ post }) {
  return (
    <article className="item-s">
      <div className="thumb-s">
        <Cover post={post} variant="sm" />
      </div>
      <div>
        <time>{formatTime(post.published_at || post.created_at)}</time>
        <h4>
          <Link href={articleHref(post)}>{post.title}</Link>
        </h4>
      </div>
    </article>
  );
}

// Bài dạng hàng ngang ở trang danh sách (Tin tức / Chuyên mục)
export function ListItem({ post }) {
  return (
    <article className="item">
      <div className="thumb-r">
        <Cover post={post} variant="sm" />
      </div>
      <div>
        <time>{formatTime(post.published_at || post.created_at)}</time>
        <h4>
          <Link href={articleHref(post)}>{post.title}</Link>
        </h4>
        {post.excerpt && <p>{post.excerpt}</p>}
      </div>
    </article>
  );
}

// Thanh phân trang
export function Pager({ basePath, page, totalPages }) {
  if (totalPages <= 1) return null;
  const href = (p) => `${basePath}${basePath.includes('?') ? '&' : '?'}page=${p}`;
  return (
    <div className="pager">
      {page > 1 && <Link href={href(page - 1)}>‹</Link>}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
        p === page ? (
          <b key={p}>{p}</b>
        ) : (
          <Link key={p} href={href(p)}>
            {p}
          </Link>
        )
      )}
      {page < totalPages && <Link href={href(page + 1)}>›</Link>}
    </div>
  );
}
