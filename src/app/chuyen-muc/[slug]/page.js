import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCategoryBySlug, getPublishedPosts } from '../../../lib/data';
import {
  FeaturePost,
  ListItem,
  Pager,
} from '../../../components/PostCards';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 9;

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = params;

  // Các chuyên mục có trang riêng
  if (slug === 'trang-chu-khong-gian-van-hoa') redirect('/');
  if (slug === 'tin-tuc-khong-gian-van-hoa') redirect('/tin-tuc');
  if (slug === 'cuoc-doi-su-nghiep') redirect('/cuoc-doi');

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  if (category.is_external && category.external_url) {
    redirect(category.external_url);
  }

  const page = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);
  const offset = page === 1 ? 0 : 1 + (page - 1) * PAGE_SIZE;
  const limit = page === 1 ? PAGE_SIZE + 1 : PAGE_SIZE;
  const { posts, total } = await getPublishedPosts(slug, { limit, offset });

  const featured = page === 1 ? posts[0] : null;
  const list = page === 1 ? posts.slice(1) : posts;
  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(0, total - 1) / PAGE_SIZE)
  );

  return (
    <main>
      <section className="sec wrap" style={{ paddingTop: 22 }}>
        <div className="crumb">
          <Link href="/">Trang chủ</Link> / <b>{category.name}</b>
        </div>
        <div className="sec-head">
          <h2>{category.name}</h2>
        </div>
        {category.short_desc && (
          <p style={{ color: 'var(--grey)', marginTop: 10, lineHeight: 1.6 }}>
            {category.short_desc}
          </p>
        )}

        {featured && (
          <div style={{ marginTop: 18, maxWidth: 640 }}>
            <FeaturePost post={featured} />
          </div>
        )}
        {list.length > 0 && (
          <div className="list-v">
            {list.map((post) => (
              <ListItem key={post.id} post={post} />
            ))}
          </div>
        )}
        {total === 0 && (
          <p className="note-line">
            Chuyên mục chưa có bài viết. Bài sẽ hiện tại đây ngay khi Admin
            đăng bài vào chuyên mục này.
          </p>
        )}
        <Pager
          basePath={`/chuyen-muc/${slug}`}
          page={page}
          totalPages={totalPages}
        />
      </section>
    </main>
  );
}
