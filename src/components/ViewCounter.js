'use client';

import { useEffect, useRef } from 'react';

// Tăng lượt xem bài viết 1 lần mỗi lần mở trang chi tiết
// (gọi API phía server vì khách không có quyền sửa bảng posts).
export default function ViewCounter({ postId }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !postId) return;
    done.current = true;
    fetch('/api/bai-viet/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: postId }),
    }).catch(() => {});
  }, [postId]);
  return null;
}
