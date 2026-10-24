import Link from 'next/link';

import { getMediaAlbums, getMediaItems } from '../../lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Thư viện ảnh & video — Không gian văn hóa Hồ Chí Minh',
};

// Trang Thư viện công khai — xem THEO TỪNG MỤC SỰ KIỆN:
// - Mở /thu-vien: chỉ thấy danh sách các mục sự kiện (dạng thư mục),
//   KHÔNG còn lưới ảnh trộn tất cả các mục với nhau.
// - Bấm vào một mục: chỉ xem ảnh/video của đúng mục đó.
// - Ảnh/video chưa xếp vào mục sự kiện nào (kể cả ảnh bìa bài đăng
//   tự lưu vào thư viện) KHÔNG hiện ngoài web — muốn hiện thì vào
//   Admin → Thư viện media, chọn mục ở hộp chọn dưới mỗi ảnh.

function hrefFor({ loai, album }) {
  const p = [];
  if (loai) p.push(`loai=${loai}`);
  if (album) p.push(`album=${album}`);
  return p.length ? `/thu-vien?${p.join('&')}` : '/thu-vien';
}

export default async function ThuVienPage({ searchParams }) {
  const loai = searchParams?.loai || '';
  const album = searchParams?.album ? Number(searchParams.album) : null;

  const [albums, allItems] = await Promise.all([
    getMediaAlbums(),
    getMediaItems({ limit: 500 }),
  ]);

  // Chỉ tính những file đã xếp vào một mục sự kiện.
  const items = (allItems || []).filter((it) => it.album_id);
  const byAlbum = {};
  items.forEach((it) => {
    if (!byAlbum[it.album_id]) byAlbum[it.album_id] = [];
    byAlbum[it.album_id].push(it);
  });
  const albumById = Object.fromEntries(albums.map((a) => [a.id, a]));

  // ---------- Đang xem MỘT mục sự kiện: chỉ hiện file của mục đó ----------
  if (album) {
    const current = albumById[album];
    if (!current) {
      return (
        <main>
          <section className="sec wrap" style={{ paddingTop: 22 }}>
            <div className="crumb">
              <Link href="/">Trang chủ</Link> /{' '}
              <Link href="/thu-vien">Thư viện ảnh & video</Link>
            </div>
            <p style={{ color: 'var(--grey)', fontSize: 14, marginTop: 18 }}>
              Mục sự kiện này không tồn tại.{' '}
              <Link href="/thu-vien">← Về danh sách các mục sự kiện</Link>
            </p>
          </section>
        </main>
      );
    }

    const kind = loai === 'anh' ? 'image' : loai === 'video' ? 'video' : null;
    const list = (byAlbum[album] || []).filter(
      (it) => !kind || it.kind === kind
    );

    return (
      <main>
        <section className="sec wrap thu-vien-album" style={{ paddingTop: 22 }}>
          <div className="crumb">
            <Link href="/">Trang chủ</Link> /{' '}
            <Link href="/thu-vien">Thư viện ảnh & video</Link> /{' '}
            <b>{current.title}</b>
          </div>
          <div className="sec-head">
            <h2>🗂 {current.title}</h2>
          </div>
          {current.description ? (
            <p className="album-desc-full" style={{ marginTop: -6 }}>
              {current.description}
            </p>
          ) : null}
          <div className="filter-row">
            <Link
              href={hrefFor({ album })}
              className={`mini-btn${!loai ? ' on' : ''}`}
            >
              Tất cả
            </Link>
            <Link
              href={hrefFor({ loai: 'anh', album })}
              className={`mini-btn${loai === 'anh' ? ' on' : ''}`}
            >
              Ảnh
            </Link>
            <Link
              href={hrefFor({ loai: 'video', album })}
              className={`mini-btn${loai === 'video' ? ' on' : ''}`}
            >
              Video
            </Link>
          </div>
          <p className="album-back" style={{ marginTop: 14 }}>
            <Link href="/thu-vien">← Tất cả các mục sự kiện</Link>
          </p>
          {list.length === 0 ? (
            <p style={{ color: 'var(--grey)', fontSize: 14, marginTop: 18 }}>
              Mục sự kiện “{current.title}” chưa có{' '}
              {loai === 'anh' ? 'ảnh' : loai === 'video' ? 'video' : 'ảnh/video'}{' '}
              nào.
            </p>
          ) : (
            <div className="gal-grid">
              {list.map((item) => (
                <div className="gal-cell" key={item.id}>
                  {item.kind === 'video' ? (
                    <video src={item.url} controls preload="metadata" />
                  ) : (
                    <Link href={`/thu-vien/${item.id}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.caption || 'Ảnh'} />
                    </Link>
                  )}
                  <div className="gal-cap">
                    <b>{item.caption || (item.kind === 'video' ? 'Video' : 'Ảnh')}</b>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  // ---------- Danh sách các mục sự kiện (không trộn ảnh các mục) ----------
  const kind = loai === 'anh' ? 'image' : loai === 'video' ? 'video' : null;
  const visibleAlbums = albums.filter((a) => {
    if (!kind) return true;
    return (byAlbum[a.id] || []).some((it) => it.kind === kind);
  });

  return (
    <main>
      <section className="sec wrap" style={{ paddingTop: 22 }}>
        <div className="crumb">
          <Link href="/">Trang chủ</Link> / <b>Thư viện ảnh & video</b>
        </div>
        <div className="sec-head">
          <h2>Thư viện ảnh & video</h2>
        </div>
        <div className="filter-row">
          <Link href={hrefFor({})} className={`mini-btn${!loai ? ' on' : ''}`}>
            Tất cả các mục
          </Link>
          <Link
            href={hrefFor({ loai: 'anh' })}
            className={`mini-btn${loai === 'anh' ? ' on' : ''}`}
          >
            Mục có ảnh
          </Link>
          <Link
            href={hrefFor({ loai: 'video' })}
            className={`mini-btn${loai === 'video' ? ' on' : ''}`}
          >
            Mục có video
          </Link>
        </div>
        {visibleAlbums.length === 0 ? (
          <p style={{ color: 'var(--grey)', fontSize: 14, marginTop: 18 }}>
            Thư viện đang được cập nhật. Thầy/cô và các em quay lại sau nhé.
          </p>
        ) : (
          <div className="album-grid">
            {visibleAlbums.map((a) => {
              const list = byAlbum[a.id] || [];
              const photos = list.filter((it) => it.kind !== 'video').length;
              const videos = list.filter((it) => it.kind === 'video').length;
              const cover = list.find((it) => it.kind !== 'video');
              return (
                <Link
                  key={a.id}
                  className="album-card"
                  href={hrefFor({ album: a.id })}
                >
                  {cover ? (
                    <div className="album-cover">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover.url} alt={a.title} />
                    </div>
                  ) : (
                    <div className="album-cover album-cover-ph">📁</div>
                  )}
                  <div className="album-body">
                    <b>{a.title}</b>
                    <div className="album-meta">
                      {photos > 0 ? `${photos} ảnh` : ''}
                      {photos > 0 && videos > 0 ? ' • ' : ''}
                      {videos > 0 ? `${videos} video` : ''}
                      {photos === 0 && videos === 0 ? 'Chưa có ảnh/video' : ''}
                    </div>
                    {a.description ? (
                      <div className="album-desc">{a.description}</div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
