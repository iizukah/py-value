"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header
      className="border-b px-4 py-3"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-main)] rounded"
          style={{
            fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
            color: "var(--color-accent-emerald)",
            textShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
          }}
        >
          EXER
        </Link>
        <nav className="flex gap-4 text-sm" role="navigation" aria-label="メインメニュー">
          <Link
            href="/py-value"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] rounded px-1"
          >
            問題一覧
          </Link>
          <Link
            href="/py-value/favorites"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] rounded px-1"
          >
            お気に入り
          </Link>
          <Link
            href="/py-value/history"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] rounded px-1"
          >
            履歴
          </Link>
          <Link
            href="/admin"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] rounded px-1"
          >
            管理
          </Link>
        </nav>
      </div>
    </header>
  );
}
