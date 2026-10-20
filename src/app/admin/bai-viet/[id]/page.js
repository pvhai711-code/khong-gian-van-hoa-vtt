'use client';

import { useEffect, useState } from 'react';
import PostForm from '../../../../components/admin/PostForm';
import { useAdmin } from '../../../../components/admin/AdminShell';

export default function EditPostPage({ params }) {
  const { supabase, user, isAdmin } = useAdmin();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();
      if (err || !data) {
        setError('Không tìm thấy bài viết (hoặc thầy/cô không có quyền xem bài này).');
        return;
      }
      if (!isAdmin && data.author_id !== user.id) {
        setError('Thầy/cô chỉ sửa được bài viết của mình.');
        return;
      }
      setPost(data);
    })();
  }, [supabase, params.id, isAdmin, user.id]);

  return (
    <>
      <h2>Sửa bài viết</h2>
      <p className="sub">Thay đổi sẽ áp dụng ngay sau khi bấm “Lưu bài viết”.</p>
      {error && <div className="alert alert-err">{error}</div>}
      {!post && !error && <p className="spin">Đang tải bài viết...</p>}
      {post && <PostForm key={post.id} initial={post} />}
    </>
  );
}
