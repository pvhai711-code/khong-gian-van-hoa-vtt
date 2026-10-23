import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getRelatedPosts } from '../../../lib/data';
import { formatTime, categoryHref } from '../../../lib/utils';
import { SmallItem } from '../../../components/PostCards';
import ViewCounter from '../../../components/ViewCounter';

export const dynamic = 'force-dynamic';

// Biến link YouTube thường thành link nhúng; nếu là file video thì giữ nguyên.
function toEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

function isVideoFile(url) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url || '');
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  return {
    title: post
      ? `${post.title} — Không gian văn hóa Hồ Chí Minh`
      : 'Bài viết — Không gian văn hóa Hồ Chí Minh',
    description: post?.excerpt || undefined,
  };
}

export default async function ArticlePage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 4);
  const embed = toEmbedUrl(post.video_url);
  const catHref = post.categories
    ? categoryHref({
        slug: post.categories.slug,
        is_external: false,
      })
    : '/tin-tuc';

  return (
    <main>
      <ViewCounter postId={post.id} />
      <section className="sec wrap article-page" style={{ paddingTop: 22 }}>
        <div className="crumb">
          <Link href="/">Trang chủ</Link>
          {post.categories && (
            <>
              {' / '}
              <Link href={catHref}>{post.categories.name}</Link>
            </>
          )}
          {' / '}
          <b>Chi tiết bài viết</b>
        </div>
        <h1>{post.title}</h1>
        <div className="d-meta">
          <time>{formatTime(post.published_at || post.created_at)}</time>
          &nbsp;•&nbsp; <span className="d-views">👁 {Number(post.views || 0) + 1} lượt xem</span>
          &nbsp;•&nbsp; Chuyên mục: {post.categories?.name || '—'}
        </div>
        {post.excerpt && <p className="d-lead">{post.excerpt}</p>}

        {post.content ? (
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <div className="article-body">
            <p>
              Nội dung bài viết đang được cập nhật. Thầy/cô và các em quay lại
              sau ít phút nhé.
            </p>
          </div>
        )}

        {embed &&
          (isVideoFile(post.video_url) ? (
            <div className="video-embed">
              <video src={post.video_url} controls preload="metadata" />
            </div>
          ) : (
            <div className="video-embed">
              <iframe
                src={embed}
                title="Video của bài viết"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}

        <blockquote>
          “Không có gì quý hơn độc lập, tự do.”
          <br />
          <small>— Chủ tịch Hồ Chí Minh</small>
        </blockquote>

        <p>
          <Link className="more" href="/">
            ← Quay lại Trang chủ
          </Link>
        </p>

        {related.length > 0 && (
          <>
            <div className="sec-head" style={{ marginTop: 26 }}>
              <h2 style={{ fontSize: 20 }}>Bài viết liên quan</h2>
            </div>
            <div className="small-list" style={{ marginTop: 16 }}>
              {related.map((p) => (
                <SmallItem key={p.id} post={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
