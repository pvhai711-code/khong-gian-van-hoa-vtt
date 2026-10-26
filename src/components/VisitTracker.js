'use client';

import { useEffect } from 'react';

// Gửi nhịp tim về /api/track: 1 lần khi mở trang + mỗi 60 giây khi còn mở trang.
// Nhờ đó chân trang đếm được số người đang online thật. Lỗi mạng thì bỏ qua
// lặng lẽ, không hiện gì cho người xem.
export default function VisitTracker() {
  useEffect(() => {
    let stopped = false;
    const ping = () => {
      fetch('/api/track', { method: 'POST' }).catch(() => {});
    };
    ping();
    const timer = setInterval(() => {
      if (!stopped) ping();
    }, 60 * 1000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);
  return null;
}
