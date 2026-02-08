"use client";

/**
 * CD-024: お気に入り一覧をタイル表示（SC-001 と同様）、一覧へ戻るは page でボタン＋アイコン
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Play } from "lucide-react";
import { getOrCreateClientId } from "@/lib/client-id";

interface FavoriteItem {
  id: string;
  workbookId: string;
  questionId: string;
  clientId: string;
  count: number;
}

export function FavoritesListClient({ workbookId }: { workbookId: string }) {
  const [list, setList] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/favorites`, {
      headers: { "X-Client-Id": clientId },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), [workbookId]);

  const remove = (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/questions/${questionId}/favorite`, {
      method: "DELETE",
      headers: { "X-Client-Id": clientId },
    }).then(() => load());
  };

  if (loading) return <p className="mt-4 text-[var(--color-text-muted)]">読み込み中...</p>;
  if (list.length === 0) return <p className="mt-4 text-[var(--color-text-muted)]">お気に入りはありません。</p>;

  return (
    <ul
      className="question-tiles mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      style={{ gap: "var(--space-4)" }}
    >
      {list.map((f) => (
        <li
          key={f.id}
          className="question-tile flex min-h-[220px] flex-col rounded-[var(--radius-lg)] border p-4 text-left"
          style={{
            minWidth: "var(--tile-min-width)",
            backgroundColor: "var(--glass-bg)",
            borderColor: "var(--glass-border)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div
            className="tile-header mb-2 rounded-[var(--radius-md)] border px-3 py-2"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.22) 0%, rgba(13,148,136,0.14) 100%)",
              borderColor: "rgba(16,185,129,0.4)",
            }}
          >
            <div className="tile-subtitle mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent-emerald)]">
              お気に入り
            </div>
            <div className="tile-title-row flex items-center gap-3">
              <span className="tile-display-title min-w-0 flex-1 text-[1.1rem] font-bold text-[var(--color-text)]">
                問題 {f.questionId}
              </span>
            </div>
          </div>
          <div className="tile-body mb-2 flex flex-1 min-h-0">
            <div className="tile-body-left flex min-w-0 flex-1 flex-col justify-center">
              <div className="tile-excerpt text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                Try ボタンから問題に挑戦できます。
              </div>
            </div>
          </div>
          <div className="tile-footer mt-auto flex w-full items-center justify-between gap-2">
            <div className="btn-favorite-block inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.04)", color: "#f87171" }}>
              <Heart size={16} fill="currentColor" aria-hidden />
              <span className="tile-favorite-count m-0">{f.count}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => remove(e, f.questionId)}
                className="btn btn-ghost rounded-full border px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-text)]"
                style={{ borderColor: "var(--color-border)" }}
              >
                解除
              </button>
              <Link
                href={`/${workbookId}/questions/${f.questionId}`}
                className="btn btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, var(--color-accent-emerald) 0%, #0d9488 100%)",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
                }}
              >
                <Play size={16} aria-hidden />
                Try
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
