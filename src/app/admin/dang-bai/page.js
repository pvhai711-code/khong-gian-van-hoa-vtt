'use client';

import PostForm from '../../../components/admin/PostForm';
import { useAdmin } from '../../../components/admin/AdminShell';

export default function NewPostPage() {
  const { role } = useAdmin();
  return (
    <>
      <h2>Đăng bài mới</h2>
      <p className="sub">
        {role === 'ctv'
          ? 'Cộng tác viên gửi bài ở trạng thái chờ duyệt — Admin chính duyệt xong bài mới hiện trên website.'
          : 'Biên tập viên và Admin chính đăng bài là bài hiện ngay trên website (chọn trạng thái “Xuất bản ngay”).'}
      </p>
      <PostForm />
    </>
  );
}
