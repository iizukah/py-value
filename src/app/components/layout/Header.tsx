"use client";

/* CD-001, CD-002, CD-003: sticky + glass, logo SVG, nav with icons (mock.html CP-001) */

import Link from "next/link";
import { List, Heart, History, Settings } from "lucide-react";

export default function Header() {
  return (
    <header
      className="app-header sticky top-0 z-[100] flex items-center justify-between border-b px-4 py-3"
      style={{
        backgroundColor: "var(--glass-bg)",
        borderColor: "var(--color-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
        <Link
          href="/"
          className="logo-link flex items-center focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-main)] rounded"
          aria-label="ホームへ"
        >
          <svg
            width="110"
            height="32"
            viewBox="0 0 130 40"
            className="logo-glow inline-block"
            style={{
              filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))",
            }}
            aria-hidden
          >
            <path
              d="M5 10H25M5 20H18M5 30H25"
              stroke="var(--color-accent-emerald)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="28" cy="20" r="3.5" fill="var(--color-accent-emerald)" />
            <text
              x="42"
              y="32"
              fill="var(--color-text)"
              style={{
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              EXER
            </text>
          </svg>
        </Link>
        <nav className="nav flex gap-2 items-center" role="navigation" aria-label="メインナビゲーション">
          <Link
            href="/py-value"
            className="inline-flex items-center gap-2 rounded-[999px] px-3 py-2 text-sm text-[var(--color-accent-emerald)] no-underline transition-colors hover:bg-[rgba(16,185,129,0.12)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] rounded-full"
          >
            <List size={16} aria-hidden />
            問題一覧
          </Link>
          <Link
            href="/py-value/favorites"
            className="inline-flex items-center gap-2 rounded-[999px] px-3 py-2 text-sm text-[var(--color-accent-emerald)] no-underline transition-colors hover:bg-[rgba(16,185,129,0.12)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] rounded-full"
          >
            <Heart size={16} aria-hidden />
            お気に入り
          </Link>
          <Link
            href="/py-value/history"
            className="inline-flex items-center gap-2 rounded-[999px] px-3 py-2 text-sm text-[var(--color-accent-emerald)] no-underline transition-colors hover:bg-[rgba(16,185,129,0.12)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] rounded-full"
          >
            <History size={16} aria-hidden />
            履歴
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-[999px] px-3 py-2 text-sm text-[var(--color-accent-emerald)] no-underline transition-colors hover:bg-[rgba(16,185,129,0.12)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] rounded-full"
          >
            <Settings size={16} aria-hidden />
            管理
          </Link>
        </nav>
      </div>
    </header>
  );
}
