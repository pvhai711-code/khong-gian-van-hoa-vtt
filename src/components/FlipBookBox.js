'use client';

import { useState, useEffect } from 'react';

// Mục SÁCH LẬT trên trang Tin tức: bấm vào ô sách để lật sách ngay trên
// website (khung xem Heyzine), kèm nút mở toàn màn hình sang trang Heyzine
// nếu trình duyệt chặn khung nhúng.
const FLIP_URL = 'https://heyzine.com/flip-book/437b823c6d.html#page/1';

export default function FlipBookBox() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className="side-box">
        <h3>Sách lật</h3>
        <button
          type="button"
          className="ph-s flip-tile"
          onClick={() => setOpen(true)}
        >
          📖 SÁCH LẬT
          <br />
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            Bấm để xem sách ngay trên website
          </span>
        </button>
      </div>

      {open && (
        <div className="flip-modal" onClick={() => setOpen(false)}>
          <div
            className="flip-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flip-modal-head">
              <b>📖 Sách lật</b>
              <span>
                <a
                  href={FLIP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mini-btn"
                >
                  Mở toàn màn hình ↗
                </a>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() => setOpen(false)}
                >
                  ✕ Đóng
                </button>
              </span>
            </div>
            <iframe src={FLIP_URL} title="Sách lật" allowFullScreen />
            <p className="flip-modal-note">
              Nếu sách không hiển thị trong khung, bấm “Mở toàn màn hình”
              để xem trên trang Heyzine.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
