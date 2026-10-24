import Link from 'next/link';
import {
  getPublishedPosts,
  getSettings,
  CATEGORY_SLUGS,
} from '../lib/data';
import {
  NewsRoundItem,
  CardItem,
  FeaturePost,
  SmallItem,
} from '../components/PostCards';

export const dynamic = 'force-dynamic';

const MUSEUM_URL =
  'https://map3d.visithcmc.vn/?startscene=scene_bnr_view4';

function EmptyNote({ text }) {
  return (
    <p className="note-line">
      {text} (Mục này sẽ có bài ngay khi Admin đăng bài hoặc thầy chạy file
      seed-posts.sql trong Supabase.)
    </p>
  );
}

export default async function HomePage() {
  const [settings, news, examples, ideology, world] = await Promise.all([
    getSettings(),
    getPublishedPosts(CATEGORY_SLUGS.news, { limit: 4 }),
    getPublishedPosts(CATEGORY_SLUGS.examples, { limit: 3 }),
    getPublishedPosts(CATEGORY_SLUGS.ideology, { limit: 5 }),
    getPublishedPosts(CATEGORY_SLUGS.world, { limit: 4 }),
  ]);

  const bannerText = settings.banner?.text || '';
  const portraitUrl = settings.raw?.portrait?.url || '/chan-dung-bac.png';
  const ideologyFeature = ideology.posts[0];
  const ideologyList = ideology.posts.slice(1, 5);
  const worldFeature = world.posts[0];
  const worldList = world.posts.slice(1, 5);

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="wrap hero-in">
          <div className="hero-txt">
            <div className="titles">
              <div className="eyebrow">
                <span>KHÔNG</span>
                <span>GIAN</span>
                <span>VĂN</span>
                <span>HÓA</span>
              </div>
              <h1>HỒ CHÍ MINH</h1>
            </div>
            <p>
              Không gian văn hóa Hồ Chí Minh của Trường THPT Võ Trường Toản —
              nơi thầy và trò cùng tìm hiểu cuộc đời, sự nghiệp, tư tưởng và
              đạo đức của Bác, học tập và làm theo lời Bác mỗi ngày.
            </p>
            <div className="hero-btns">
              <Link className="btn btn-red" href="/tin-tuc">
                Xem tin mới nhất
              </Link>
              <a
                className="btn btn-line"
                href={MUSEUM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tham quan Bảo tàng 3D ↗
              </a>
            </div>
          </div>
          <div className="hero-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portraitUrl} alt="Chân dung Chủ tịch Hồ Chí Minh" />
          </div>
        </div>
      </section>

      {/* ===== TIN MỚI ===== */}
      <section className="sec wrap" id="tin-moi">
        <div className="sec-head">
          <h2>Tin mới</h2>
          <Link href="/tin-tuc">Xem thêm →</Link>
        </div>
        <div className="news">
          <aside className="portrait-card">
            <h3>
              CHỦ TỊCH
              <br />
              HỒ CHÍ MINH
              <br />
              <small>(19/5/1890 - 2/9/1969)</small>
            </h3>
            <div className="pimg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portraitUrl} alt="Chân dung Chủ tịch Hồ Chí Minh" />
            </div>
          </aside>
          <div className="news-right">
            <div className="grid2" id="home-news-grid">
              {news.posts.map((post) => (
                <NewsRoundItem key={post.id} post={post} />
              ))}
            </div>
            {news.posts.length === 0 && (
              <EmptyNote text="Chưa có tin mới." />
            )}
            {bannerText && (
              <div className="banner">
                <span className="banner-txt">{bannerText}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== GƯƠNG ĐIỂN HÌNH ===== */}
      <section className="sec wrap" id="guong">
        <div className="sec-head">
          <h2>Gương điển hình</h2>
          <Link href={`/chuyen-muc/${CATEGORY_SLUGS.examples}`}>Xem thêm →</Link>
        </div>
        <div className="cards">
          {examples.posts.map((post) => (
            <CardItem key={post.id} post={post} />
          ))}
        </div>
        {examples.posts.length === 0 && (
          <EmptyNote text="Chưa có bài gương điển hình." />
        )}
      </section>

      {/* ===== TƯ TƯỞNG, ĐẠO ĐỨC ===== */}
      <section className="sec wrap" id="tu-tuong">
        <div className="sec-head">
          <h2>Tư tưởng, đạo đức Hồ Chí Minh</h2>
          <Link href={`/chuyen-muc/${CATEGORY_SLUGS.ideology}`}>Xem thêm →</Link>
        </div>
        {ideologyFeature ? (
          <div className="feat-grid">
            <FeaturePost post={ideologyFeature} />
            <div className="small-list">
              {ideologyList.map((post) => (
                <SmallItem key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyNote text="Chưa có bài ở mục Tư tưởng, đạo đức." />
        )}
      </section>

      {/* ===== BÁC HỒ VÀ THẾ GIỚI ===== */}
      <section className="sec wrap" id="the-gioi">
        <div className="sec-head">
          <h2>Bác Hồ và thế giới</h2>
          <Link href={`/chuyen-muc/${CATEGORY_SLUGS.world}`}>Xem thêm →</Link>
        </div>
        {worldFeature ? (
          <div className="feat-grid">
            <FeaturePost post={worldFeature} alt />
            <div className="small-list">
              {worldList.map((post) => (
                <SmallItem key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyNote text="Chưa có bài ở mục Bác Hồ và thế giới." />
        )}
      </section>
    </main>
  );
}
