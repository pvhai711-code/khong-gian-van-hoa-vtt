import Link from 'next/link';
import { getMediaAlbums, getMediaItems } from '../../lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Thư viện ảnh & video — Không gian văn hóa Hồ Chí Minh',
};

// Trang Thư viện công khai: ảnh bấm vào mở ảnh lớn (tab mới),
// video bấm nút phát là xem ngay trên trang. Lọc theo loại và theo
// từng phần sự kiện mà Admin đã tạo trong Thư viện media.
function hrefFor({ loai, album }) {
  const p = [];
  if (loai) p.push(`loai=${loai}`);
  if (album) p.push(`album=${album}`);
  return p.length ? `/thu-vien?${p.join('&')}` : '/thu-vien';
}

export default async function ThuVienPage({ searchParams }) {
  const loai = searchParams?.loai || '';
  const album = searchParams?.album ? Number(searchParams.album) : null;
  const [albums, items] = await Promise.all([
    getMediaAlbums(),
    getMediaItems({
      kind: loai === 'anh' ? 'image' : loai === 'video' ? 'video' : null,
      albumId: album,
    }),
  ]);
  const albumById = Object.fromEntries(albums.map((a) => [a.id, a.title]));
  const albumName = album ? albumById[album] : null;

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

        {albums.length > 0 && (
          <div className="filter-row" style={{ marginTop: 8 }}>
            <Link
              href={hrefFor({ loai })}
              className={`mini-btn${!album ? ' on' : ''}`}
            >
              Mọi sự kiện
            </Link>
            {albums.map((a) => (
              <Link
                key={a.id}
                href={hrefFor({ loai, album: a.id })}
                className={`mini-btn${album === a.id ? ' on' : ''}`}
              >
                🗂 {a.title}
              </Link>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <p style={{ color: 'var(--grey)', fontSize: 14, marginTop: 18 }}>
            {albumName
              ? `Phần sự kiện “${albumName}” chưa có ${
                  loai === 'anh' ? 'ảnh' : loai === 'video' ? 'video' : 'ảnh/video'
                } nào.`
              : 'Thư viện đang được cập nhật. Thầy/cô và các em quay lại sau nhé.'}
          </p>
        ) : (
          <div className="gal-grid">
            {items.map((item) => (
              <div className="gal-cell" key={item.id}>
                {item.kind === 'video' ? (
                  <video src={item.url} controls preload="metadata" />
                ) : (
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.caption || 'Ảnh'} />
                  </a>
                )}
                <div className="gal-cap">
                  <b>{item.caption || (item.kind === 'video' ? 'Video' : 'Ảnh')}</b>
                  {item.album_id && albumById[item.album_id] ? (
                    <>
                      <br />
                      🗂 {albumById[item.album_id]}
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
