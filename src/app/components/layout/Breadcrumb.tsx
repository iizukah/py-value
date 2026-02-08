"use client";

/* CD-004, DD-001, DD-002, DD-005: パンくず 中央寄せ・アイコン・最終セグメントをタイトルに */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, BookOpen, Heart, History, FileCode } from "lucide-react";
import { buildBreadcrumbs } from "@/lib/breadcrumb";
import { getOrCreateClientId } from "@/lib/client-id";

const WORKBOOK_TITLES: Record<string, string> = {
  "py-value": "Pythonデータ分析",
};

function BreadcrumbIcon({ label }: { label: string }) {
  if (label === "お気に入り") return <Heart size={14} aria-hidden />;
  if (label === "履歴") return <History size={14} aria-hidden />;
  if (label === "問題") return <FileCode size={14} aria-hidden />;
  return null;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const workbookId = segments[0];
  const workbookTitle = workbookId ? WORKBOOK_TITLES[workbookId] : undefined;
  const items = buildBreadcrumbs(pathname ?? "/", workbookTitle);
  const [lastLabelOverride, setLastLabelOverride] = useState<string | null>(null);

  useEffect(() => {
    setLastLabelOverride(null);
    if (!pathname || segments.length < 2) return;
    const wb = segments[0];
    if (segments[1] === "questions" && segments[2]) {
      const qId = segments[2];
      fetch(`/api/workbooks/${wb}/questions/${qId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((q) => q?.title && setLastLabelOverride(`問題: ${q.title}`))
        .catch(() => {});
      return;
    }
    if (segments[1] === "history" && segments[2]) {
      const clientId = getOrCreateClientId();
      const hid = segments[2];
      fetch(`/api/workbooks/${wb}/histories/${hid}`, { headers: { "X-Client-Id": clientId } })
        .then((r) => (r.ok ? r.json() : null))
        .then((h) => {
          if (h?.questionId) {
            fetch(`/api/workbooks/${wb}/questions/${h.questionId}`)
              .then((r2) => (r2.ok ? r2.json() : null))
              .then((q) => setLastLabelOverride(q?.title ? `${q.title}（履歴）` : "履歴詳細"));
          } else {
            setLastLabelOverride("履歴詳細");
          }
        })
        .catch(() => setLastLabelOverride("履歴詳細"));
    }
  }, [pathname, segments.join("/")]);

  if (items.length <= 1) return null;

  const lastLabel = items.length > 0 ? (lastLabelOverride ?? items[items.length - 1].label) : "";

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-2" aria-label="パンくず">
      <div className="breadcrumb flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span className="breadcrumb-sep inline-flex" aria-hidden>
          <Home size={14} />
        </span>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const displayLabel = isLast ? lastLabel : item.label;
          return (
            <span key={`${item.href}-${i}`} className="flex items-center gap-2">
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
                <Link href="/" className="inline-flex items-center gap-1.5 text-[var(--color-accent-emerald)] no-underline hover:underline">
                  {item.label}
                </Link>
              ) : isLast ? (
                <span className="inline-flex items-center gap-1.5 text-[var(--color-text)]">
                  <BreadcrumbIcon label={segments[1] === "questions" && segments[2] ? "問題" : displayLabel} />
                  {displayLabel}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-[var(--color-accent-emerald)] no-underline hover:underline"
                >
                  <BreadcrumbIcon label={item.label} />
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
