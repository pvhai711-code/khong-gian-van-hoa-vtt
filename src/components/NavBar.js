'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categoryHref } from '../lib/utils';

// Thanh menu đỏ chính — danh sách chuyên mục lấy từ bảng categories
// (chỉ hiện những mục show_in_menu = true). Tên dài tự tách 2 dòng.
function splitName(name) {
  const words = (name || '').split(' ');
  if (words.length <= 2) return [name];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

export default function NavBar({ categories }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = (categories || []).filter((c) => c.show_in_menu);

  return (
    <nav className={`main${open ? ' open' : ''}`} id="mainnav">
      <button
        className="burger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở menu"
      >
        ☰ &nbsp;MENU
      </button>
      <div className="wrap">
        {items.map((cat) => {
          const href = categoryHref(cat);
          const external = cat.is_external;
          const isActive =
            !external &&
            (href === pathname ||
              (href !== '/' && pathname?.startsWith(href)));
          const lines = splitName(cat.name);
          const content = (
            <>
              {href === '/' && (
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="#ffffff"
                  aria-hidden="true"
                >
                  <path d="M12 3l9 8h-3v9h-4v-6H10v6H6v-9H3z" />
                </svg>
              )}
              {lines.map((ln, i) => (
                <span key={i}>{ln}</span>
              ))}
              {external && <span>↗</span>}
            </>
          );
          return external ? (
            <a
              key={cat.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {content}
            </a>
          ) : (
            <Link
              key={cat.id}
              href={href}
              className={isActive ? 'active' : undefined}
              onClick={() => setOpen(false)}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
