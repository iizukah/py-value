"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          EXER
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/py-value" className="text-gray-600 hover:text-gray-900">
            問題一覧
          </Link>
          <Link href="/py-value/favorites" className="text-gray-600 hover:text-gray-900">
            お気に入り
          </Link>
          <Link href="/py-value/history" className="text-gray-600 hover:text-gray-900">
            履歴
          </Link>
          <Link href="/admin" className="text-gray-600 hover:text-gray-900">
            管理
          </Link>
        </nav>
      </div>
    </header>
  );
}
