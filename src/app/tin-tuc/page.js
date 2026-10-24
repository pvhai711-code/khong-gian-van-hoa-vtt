import Link from 'next/link';
import {
  getPublishedPosts,
  getTopViewed,
  getVideoPosts,
  getMediaItems,
  searchPosts,
  CATEGORY_SLUGS,
} from '../../lib/data';
import { FeaturePost, ListItem, Pager } from '../../components/PostCards';
import Cover from '../../components/Cover';
import FlipBookBox from '../../components/FlipBookBox';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 9;

async function Sidebar({ topViewed, videoPosts }) {
  const video = videoPosts[0];
  const [photos, videos] = await Promise.all([
    getMediaItems({ kind: 'image', limit: 1 }),
    getMediaItems({ kind: 'video', limit: 1 }),
  ]);
  const latestPhoto = photos[0] || null;
  const latestVideo = videos[0] || null;
  return (
    <aside className="side">
      <div className="side-box">
        <h3>Video</h3>
        {latestVideo ? (
          <video src={latestVideo.url} controls preload="metadata" />
        ) : video ? (
          <Link className="mini-vid" href={`/bai-viet/${video.slug}`}>
            <Cover post={video} />
            <span>▶ {video.title}</span>
          </Link>
        ) : (
          <Link className="ph-s" href="/thu-vien?loai=video">
            ▶ VIDEO GIỚI THIỆU
            <br />
            KHÔNG GIAN VĂN HÓA HỒ CHÍ MINH
          </Link>
        )}
      </div>
      <div className="side-box">
        <h3>Ảnh</h3>
        {latestPhoto ? (
          <Link className="side-img" href="/thu-vien?loai=anh">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={latestPhoto.url} alt="Ảnh mới nhất trong thư viện" />
          </Link>
        ) : (
          <Link className="ph-s" href="/thu-vien?loai=anh">
            NHỮNG KHÔNG GIAN VĂN HÓA
            <br />
            HỒ CHÍ MINH NỔI BẬT
          </Link>
        )}
      </div>
      <FlipBookBox />
      <div className="side-box">
        <h3>Bài xem nhiều nhất</h3>
        {topViewed.length > 0 ? (
          <ol className="top7">
            {topViewed.map((p) => (
              <li key={p.id}>
                <Link href={`/bai-viet/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ol>
        ) : (
          <p style={{ color: 'var(--grey)', fontSize: 14 }}>
            Chưa có số liệu lượt xem.
          </p>
        )}
      </div>
    </aside>
  );
}

export default async function TinTucPage({ searchParams }) {
  const q = searchParams?.q || '';
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);

  // Chế độ tìm kiếm
  if (q) {
    const results = await searchPosts(q);
    const topViewed = await getTopViewed(7);
    const videoPosts = await getVideoPosts(1);
    return (
      <main>
        <section className="sec wrap" style={{ paddingTop: 22 }}>
          <div className="crumb">
            <Link href="/">Trang chủ</Link> / <b>Tìm kiếm</b>
          </div>
          <div className="sec-head">
            <h2>Kết quả tìm kiếm: “{q}”</h2>
          </div>
          <div className="cat-grid">
            <div>
              {results.length === 0 ? (
                <p className="note-line">
                  Không tìm thấy bài viết nào phù hợp. Thầy/cô và các em thử từ
                  khóa khác nhé.
                </p>
              ) : (
                <div className="list-v">
                  {results.map((post) => (
                    <ListItem key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
            <Sidebar topViewed={topViewed} videoPosts={videoPosts} />
          </div>
        </section>
      </main>
    );
  }

  // Trang 1: bài nổi bật + 9 bài tiếp theo; các trang sau: mỗi trang 9 bài.
  const offset = page === 1 ? 0 : 1 + (page - 1) * PAGE_SIZE;
  const limit = page === 1 ? PAGE_SIZE + 1 : PAGE_SIZE;
  const [{ posts, total }, topViewed, videoPosts] = await Promise.all([
    getPublishedPosts(CATEGORY_SLUGS.news, { limit, offset }),
    getTopViewed(7),
    getVideoPosts(1),
  ]);
  const featured = page === 1 ? posts[0] : null;
  const list = page === 1 ? posts.slice(1) : posts;
  const totalPages = Math.max(1, Math.ceil(Math.max(0, total - 1) / PAGE_SIZE));

  return (
    <main>
      <section className="sec wrap" style={{ paddingTop: 22 }}>
        <div className="crumb">
          <Link href="/">Trang chủ</Link> / <b>Tin tức - Sự kiện</b>
        </div>
        <div className="sec-head">
          <h2>Tin tức - Sự kiện</h2>
        </div>
        <div className="cat-grid">
          <div>
            {featured && <FeaturePost post={featured} />}
            {list.length > 0 && (
              <div className="list-v">
                {list.map((post) => (
                  <ListItem key={post.id} post={post} />
                ))}
              </div>
            )}
            {total === 0 && (
              <p className="note-line">
                Chưa có bài viết nào. Bài sẽ hiện tại đây ngay khi Admin đăng
                bài ở chuyên mục Tin tức - Sự kiện (hoặc chạy file
                seed-posts.sql).
              </p>
            )}
            <Pager basePath="/tin-tuc" page={page} totalPages={totalPages} />
          </div>
          <Sidebar topViewed={topViewed} videoPosts={videoPosts} />
        </div>
      </section>
    </main>
  );
}
