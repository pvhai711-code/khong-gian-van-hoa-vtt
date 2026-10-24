import Link from 'next/link';

import { getMediaAlbums, getMediaItems } from '../../../lib/data';

export const dynamic = 'force-dynamic';

// Trang chi tiết 1 ảnh/video trong Thư viện — hiển thị như trang tin:
// ảnh lớn + lời giới thiệu ngắn (chú thích thầy gõ trong Admin) +
// tên mục sự kiện + ngày đăng.
function isFileName(text) {
  return /\.(jpe?g|png|webp|gif|mp4|mov|webm|avi)$/i.test(
    (text || '').trim()
  );
}

export default async function MediaDetailPage({ params }) {
  const wanted = String(params?.id || '');
  const [albums, allItems] = await Promise.all([
    getMediaAlbums(),
    getMediaItems({ limit: 500 }),
  ]);
  const item = (allItems || []).find((it) => String(it.id) === wanted);

  if (!item) {
    return (
      <main>
        <section className="sec wrap" style={{ paddingTop: 22 }}>
          <div className="crumb">
            <Link href="/">Trang chủ</Link> /{' '}
            <Link href="/thu-vien">Thư viện ảnh & video</Link>
          </div>
          <p style={{ color: 'var(--grey)', fontSize: 14, marginTop: 18 }}>
            Ảnh này không tồn tại hoặc đã bị xóa.{' '}
            <Link href="/thu-vien">← Về danh sách các mục sự kiện</Link>
          </p>
        </section>
      </main>
    );
  }

  const album = item.album_id
    ? albums.find((a) => String(a.id) === String(item.album_id))
    : null;
  // Lúc tải lên, chú thích mặc định là tên file (vd "1 (7).jpg") —
  // trường hợp đó không tính là lời giới thiệu.
  const intro = !isFileName(item.caption) ? (item.caption || '') : '';
  const title = intro || (item.kind === 'video' ? 'Video' : 'Ảnh');
  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString('vi-VN')
    : '';

  return (
    <main>
      <section className="sec wrap" style={{ paddingTop: 22 }}>
        <div className="crumb">
          <Link href="/">Trang chủ</Link> /{' '}
          <Link href="/thu-vien">Thư viện ảnh & video</Link>
          {album ? (
            <>
              {' '}
              / <Link href={`/thu-vien?album=${album.id}`}>{album.title}</Link>
            </>
          ) : null}
        </div>
        <div className="sec-head">
          <h2>{title}</h2>
        </div>
        <div className="detail-media">
          {item.kind === 'video' ? (
            <video src={item.url} controls preload="metadata" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={title} />
          )}
        </div>
        {intro ? <p className="detail-intro">{intro}</p> : null}
        <p className="detail-meta">
          {album ? (
            <>
              🗂 <Link href={`/thu-vien?album=${album.id}`}>{album.title}</Link>
              {' • '}
            </>
          ) : null}
          {item.kind === 'video' ? 'Video' : 'Ảnh'}
          {date ? ` • ${date}` : ''}
        </p>
        <p style={{ marginTop: 16 }}>
          {album ? (
            <Link href={`/thu-vien?album=${album.id}`}>
              ← Về mục {album.title}
            </Link>
          ) : (
            <Link href="/thu-vien">← Về danh sách các mục sự kiện</Link>
          )}
        </p>
      </section>
    </main>
  );
}
