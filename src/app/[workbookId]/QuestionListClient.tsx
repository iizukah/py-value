"use client";

/**
 * FR-F025, F026, F027, F009: 問題一覧のタグ表示・タグフィルター・お気に入りボタン・バッジ（SC-001, CP-003, CP-004, CP-016, CP-017）
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getOrCreateClientId } from "@/lib/client-id";

interface QuestionItem {
  id: string;
  title: string;
  tags?: string[];
  favoriteCount?: number;
}

interface SortLink {
  label: string;
  value: string;
}

interface QuestionListClientProps {
  workbookId: string;
  workbookTitle: string;
  questions: QuestionItem[];
  baseUrl: string;
  sortLinks: SortLink[];
  sortOption: string;
  tagsParam: string;
  uniqueTags: string[];
}

interface HistoryItem {
  questionId: string;
  status: string;
  isCorrect?: boolean;
  judgedAt?: string;
  createdAt: string;
}

interface FavoriteItem {
  questionId: string;
}

function useQuestionStatuses(workbookId: string, questionIds: string[]) {
  const [statusByQuestion, setStatusByQuestion] = useState<Record<string, "pass" | "fail" | "none">>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (questionIds.length === 0) {
      setLoading(false);
      return;
    }
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/histories`, {
      headers: { "X-Client-Id": clientId },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: HistoryItem[]) => {
        const list = Array.isArray(data) ? data : [];
        const byQuestion: Record<string, { isCorrect: boolean; at: string }[]> = {};
        for (const h of list) {
          if (h.status !== "submitted" || h.isCorrect === undefined) continue;
          if (!byQuestion[h.questionId]) byQuestion[h.questionId] = [];
          byQuestion[h.questionId].push({
            isCorrect: h.isCorrect,
            at: h.judgedAt ?? h.createdAt ?? "",
          });
        }
        const next: Record<string, "pass" | "fail" | "none"> = {};
        for (const qid of questionIds) {
          const attempts = byQuestion[qid];
          if (!attempts || attempts.length === 0) {
            next[qid] = "none";
            continue;
          }
          const latest = [...attempts].sort((a, b) => (b.at > a.at ? 1 : -1))[0];
          next[qid] = latest.isCorrect ? "pass" : "fail";
        }
        setStatusByQuestion(next);
      })
      .finally(() => setLoading(false));
  }, [workbookId, questionIds.join(",")]);

  return { statusByQuestion, loading };
}

function useFavoritedSet(workbookId: string) {
  const [favoritedSet, setFavoritedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/favorites`, {
      headers: { "X-Client-Id": clientId },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: FavoriteItem[]) => {
        const list = Array.isArray(data) ? data : [];
        const ids = list.map((f: { questionId?: string }) => f.questionId).filter(Boolean) as string[];
        setFavoritedSet(new Set(ids));
      })
      .finally(() => setLoading(false));
  }, [workbookId]);

  useEffect(() => refresh(), [refresh]);

  return { favoritedSet, loading, refresh };
}

function Badge({ status }: { status: "pass" | "fail" | "none" }) {
  const label = status === "pass" ? "合格" : status === "fail" ? "不合格" : "未挑戦";
  const className =
    status === "pass"
      ? "rounded-full px-2 py-0.5 text-xs font-bold text-white bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.5)]"
      : status === "fail"
        ? "rounded-full px-2 py-0.5 text-xs font-bold text-white bg-red-500 shadow-[0_0_12px_rgba(248,113,113,0.5)]"
        : "rounded-full px-2 py-0.5 text-xs font-bold text-slate-200 bg-slate-500 shadow-[0_0_6px_rgba(100,116,139,0.3)]";
  return (
    <span className={className} aria-label={`状態: ${label}`}>
      {label}
    </span>
  );
}

function QuestionCard({
  workbookId,
  question,
  baseUrl,
  status,
  isFavorited,
  favoriteCount,
  onFavoriteToggle,
  toggling,
}: {
  workbookId: string;
  question: QuestionItem;
  baseUrl: string;
  status: "pass" | "fail" | "none";
  isFavorited: boolean;
  favoriteCount: number;
  onFavoriteToggle: () => void;
  toggling: boolean;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!toggling) onFavoriteToggle();
  };

  const tags = question.tags ?? [];
  const tagsLabel = tags.length ? `タグ: ${tags.join(", ")}` : "";

  return (
    <li
      className="flex min-h-[var(--tile-min-height)] flex-col rounded-[var(--radius-lg)] border p-4 transition-colors hover:opacity-95"
      style={{
        minWidth: "var(--tile-min-width)",
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Link
          href={`${baseUrl}/questions/${question.id}`}
          className="font-medium text-[var(--color-text)] hover:text-[var(--color-accent-emerald)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] rounded"
        >
          {question.title}
        </Link>
        <Badge status={status} />
      </div>
      {tags.length > 0 && (
        <p className="mb-2 text-sm text-[var(--color-text-muted)]" aria-label={tagsLabel}>
          タグ: {tags.map((t) => (
            <span
              key={t}
              className="mr-1 inline-block rounded px-1.5 py-0.5"
              style={{ backgroundColor: "var(--glass-bg)", color: "var(--color-text-muted)" }}
            >
              {t}
            </span>
          ))}
        </p>
      )}
      <div className="mt-auto flex items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={toggling}
          aria-label={isFavorited ? "お気に入りを解除" : "お気に入りに追加"}
          className="rounded p-1 text-red-400 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] disabled:opacity-50"
        >
          {isFavorited ? "♥" : "♡"}
        </button>
        <span className="text-xs text-[var(--color-text-muted)]" aria-hidden="true">
          {favoriteCount}
        </span>
      </div>
    </li>
  );
}

export function QuestionListClient({
  workbookId,
  workbookTitle,
  questions,
  baseUrl,
  sortLinks,
  sortOption,
  tagsParam,
  uniqueTags,
}: QuestionListClientProps) {
  const questionIds = questions.map((q) => q.id);
  const { statusByQuestion, loading: statusLoading } = useQuestionStatuses(workbookId, questionIds);
  const { favoritedSet, loading: favLoading, refresh } = useFavoritedSet(workbookId);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleFavoriteToggle = useCallback(
    (questionId: string) => {
      const clientId = getOrCreateClientId();
      const isFav = favoritedSet.has(questionId);
      setTogglingId(questionId);
      const url = `/api/workbooks/${workbookId}/questions/${questionId}/favorite`;
      fetch(url, {
        method: isFav ? "DELETE" : "POST",
        headers: { "X-Client-Id": clientId },
      })
        .then(() => refresh())
        .finally(() => setTogglingId(null));
    },
    [workbookId, favoritedSet, refresh]
  );

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-bold text-[var(--color-text)]">{workbookTitle}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">問題一覧</p>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="ソート">
        {sortLinks.map(({ label, value }) => (
          <Link
            key={value}
            href={
              value === "order"
                ? tagsParam ? `${baseUrl}?${tagsParam.slice(1)}` : baseUrl
                : `${baseUrl}?sort=${value}${tagsParam}`
            }
            className={`rounded-[var(--radius-pill)] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${
              sortOption === value
                ? "text-white"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
            }`}
            style={
              sortOption === value
                ? { backgroundColor: "var(--color-accent-blue)", boxShadow: "var(--shadow-btn-secondary)" }
                : undefined
            }
          >
            {label}
          </Link>
        ))}
      </div>

      {uniqueTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="タグでフィルター">
          <span className="self-center text-sm text-[var(--color-text-muted)]">タグ:</span>
          {uniqueTags.map((tag) => {
            const currentTags = tagsParam ? tagsParam.replace(/^&tags=/, "").split(",").map((s) => s.trim()) : [];
            const isActive = currentTags.includes(tag);
            const newTags = isActive ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
            const href = newTags.length ? `${baseUrl}?tags=${newTags.join(",")}${sortOption !== "order" ? `&sort=${sortOption}` : ""}` : (sortOption !== "order" ? `${baseUrl}?sort=${sortOption}` : baseUrl);
            return (
              <Link
                key={tag}
                href={href}
                className={`rounded-[var(--radius-md)] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${
                  isActive ? "font-medium" : ""
                }`}
                style={{
                  backgroundColor: isActive ? "var(--glass-bg)" : "transparent",
                  color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
                  borderColor: "var(--color-border)",
                }}
                aria-pressed={isActive}
                aria-label={`タグ「${tag}」でフィルター`}
              >
                {tag}
              </Link>
            );
          })}
        </div>
      )}

      {questions.length === 0 ? (
        <p className="mt-6 text-[var(--color-text-muted)]">問題がありません。</p>
      ) : (
        <ul
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: "var(--space-4)" }}
          aria-busy={statusLoading || favLoading}
        >
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              workbookId={workbookId}
              question={q}
              baseUrl={baseUrl}
              status={statusByQuestion[q.id] ?? "none"}
              isFavorited={favoritedSet.has(q.id)}
              favoriteCount={q.favoriteCount ?? 0}
              onFavoriteToggle={() => handleFavoriteToggle(q.id)}
              toggling={togglingId === q.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
