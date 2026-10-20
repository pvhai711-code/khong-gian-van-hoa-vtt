'use client';

export default function BackToTop() {
  return (
    <button
      className="top"
      aria-label="Về đầu trang"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}
