"use client";

/* CD-004: 全画面共通パンくず、区切りアイコン、breadcrumb-workbook-link (mock.html) */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, BookOpen } from "lucide-react";
import { buildBreadcrumbs } from "@/lib/breadcrumb";

const WORKBOOK_TITLES: Record<string, string> = {
  "py-value": "Pythonデータ分析",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const workbookId = segments[0];
  const workbookTitle = workbookId ? WORKBOOK_TITLES[workbookId] : undefined;
  const items = buildBreadcrumbs(pathname ?? "/", workbookTitle);

  if (items.length <= 1) return null;

  return (
    <div
      className="breadcrumb flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)] px-4 py-2"
      aria-label="パンくず"
    >
      <span className="breadcrumb-sep inline-flex" aria-hidden>
        <Home size={14} />
      </span>
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-2">
          {i > 0 && (
            <span className="breadcrumb-sep inline-flex text-[var(--color-text-muted)]" aria-hidden>
              <ChevronRight size={14} />
            </span>
          )}
          {item.label === workbookTitle && workbookId ? (
            <Link
              href={item.href}
              className="breadcrumb-workbook-link inline-flex items-center gap-1.5 text-[var(--color-accent-emerald)] no-underline hover:underline"
            >
              <BookOpen size={14} />
              {item.label}
            </Link>
          ) : item.href === "/" ? (
            <Link href="/" className="text-[var(--color-accent-emerald)] no-underline hover:underline">
              {item.label}
            </Link>
          ) : i === items.length - 1 ? (
            <span className="text-[var(--color-text)]">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-[var(--color-accent-emerald)] no-underline hover:underline"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
