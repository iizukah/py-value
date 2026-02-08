"use client";

/**
 * FR-F025, F026, F027, F009 / CD-009～015: 問題一覧 mock 準拠（ソートボタン・tag-pill・question-tile・円形バッジ・btn-favorite-block・Try）
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowDownUp, Signal, Type, Heart, Award, XCircle, CircleDashed, Play } from "lucide-react";
import { getOrCreateClientId } from "@/lib/client-id";

interface QuestionItem {
  id: string;
  title: string;
  tags?: string[];
  favoriteCount?: number;
  order?: number;
  difficulty?: string;
  excerpt?: string;
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

const SORT_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  order: ArrowDownUp,
  difficulty: Signal,
  title: Type,
  favorites: Heart,
};

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

function TileBadge({ status }: { status: "pass" | "fail" | "none" }) {
  const label = status === "pass" ? "合格" : status === "fail" ? "不合格" : "未挑戦";
  const Icon = status === "pass" ? Award : status === "fail" ? XCircle : CircleDashed;
  const className =
    status === "pass"
      ? "badge badge-pass"
      : status === "fail"
        ? "badge badge-fail"
        : "badge badge-none";
  return (
    <span
      className={`inline-flex h-[90px] w-[90px] min-h-[90px] min-w-[90px] flex-shrink-0 items-center justify-center rounded-full border-2 ${className}`}
      style={
        status === "pass"
          ? {
              background: "linear-gradient(135deg, #10b981 0%, #0d9488 50%, #0f766e 100%)",
              borderColor: "rgba(255,255,255,0.35)",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
              color: "#fff",
            }
          : status === "fail"
            ? {
                background: "linear-gradient(135deg, #f87171 0%, #dc2626 50%, #b91c1c 100%)",
                borderColor: "rgba(255,255,255,0.3)",
                boxShadow: "0 0 16px rgba(248, 113, 113, 0.4)",
                color: "#fff",
              }
            : {
                background: "linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)",
                borderColor: "var(--color-border)",
                color: "#e2e8f0",
              }
      }
      aria-label={label}
    >
      <Icon size={28} aria-hidden />
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
  const order = question.order ?? 1;
  const difficulty = question.difficulty ?? "初級";
  const diffClass =
    difficulty === "初級" ? "difficulty-beginner" : difficulty === "中級" ? "difficulty-intermediate" : "difficulty-advanced";
  const tags = question.tags ?? [];
  const excerpt = question.excerpt ?? question.title;

  return (
    <li
      className="question-tile flex min-h-[300px] flex-col rounded-[var(--radius-lg)] border p-4 text-left"
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
          CHALLENGE {String(order).padStart(2, "0")}
        </div>
        <div className="tile-title-row flex items-center gap-3">
          <span className={`tile-difficulty flex-shrink-0 text-xs ${diffClass}`}>{difficulty}</span>
          <span className="tile-display-title min-w-0 flex-1 text-[1.1rem] font-bold text-[var(--color-text)]">
            {question.title}
          </span>
        </div>
      </div>
      <div className="tile-body mb-2 flex flex-1 min-h-0 gap-4">
        <div className="tile-body-left flex min-w-0 flex-1 flex-col justify-center">
          {tags.length > 0 && (
            <div className="tile-tags mb-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="tile-tag rounded-full border px-2.5 py-1 text-[11px]"
                  style={{
                    background: "rgba(16,185,129,0.15)",
                    color: "var(--color-accent-emerald)",
                    borderColor: "rgba(16,185,129,0.3)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div
            className="tile-excerpt line-clamp-5 text-[13px] leading-relaxed text-[var(--color-text-muted)]"
            style={{ display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {excerpt}
          </div>
        </div>
        <div className="tile-body-right flex flex-shrink-0 items-center justify-center">
          <TileBadge status={status} />
        </div>
      </div>
      <div className="tile-footer mt-auto flex w-full items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!toggling) onFavoriteToggle();
          }}
          disabled={toggling}
          className="btn-favorite-block inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold no-underline transition-colors hover:-translate-y-0.5 disabled:opacity-50"
          style={{
            borderColor: "var(--color-border)",
            background: "rgba(255,255,255,0.04)",
            color: isFavorited ? "#f87171" : "var(--color-text-muted)",
          }}
          aria-label={isFavorited ? "お気に入りを解除" : "お気に入りに追加"}
        >
          <Heart size={16} fill={isFavorited ? "currentColor" : "none"} aria-hidden />
          <span className="tile-favorite-count m-0">{favoriteCount}</span>
        </button>
        <Link
          href={`${baseUrl}/questions/${question.id}`}
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

  const currentTags = tagsParam ? tagsParam.replace(/^&tags=/, "").split(",").map((s) => s.trim()) : [];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-bold text-[var(--color-text)]">{workbookTitle}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">問題一覧</p>

      <div className="list-sort card mb-4 rounded-[var(--radius-md)] border p-3" style={{ backgroundColor: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <span className="label mb-1 block text-[11px] uppercase text-[var(--color-text-muted)]">ソート</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {sortLinks.map(({ label, value }) => {
            const Icon = SORT_ICONS[value];
            const isActive = sortOption === value;
            const href =
              value === "order"
                ? tagsParam ? `${baseUrl}?${tagsParam.slice(1)}` : baseUrl
                : `${baseUrl}?sort=${value}${tagsParam}`;
            return (
              <Link
                key={value}
                href={href}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${
                  isActive ? "btn btn-secondary text-white" : "btn btn-ghost text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-text)]"
                }`}
                style={
                  isActive
                    ? { background: "var(--color-accent-blue)", boxShadow: "var(--shadow-btn-secondary)" }
                    : { border: "1px solid var(--color-border)", background: "transparent" }
                }
                aria-label={`${label}でソート`}
              >
                {Icon && <Icon size={16} aria-hidden />}
                {label}
              </Link>
            );
          })}
        </div>
        {uniqueTags.length > 0 && (
          <>
            <span className="label mt-3 block text-[11px] uppercase text-[var(--color-text-muted)]">タグでフィルター</span>
            <div className="tag-filter-row mt-2 flex flex-wrap gap-2">
              {uniqueTags.map((tag) => {
                const isActive = currentTags.includes(tag);
                const newTags = isActive ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
                const href = newTags.length
                  ? `${baseUrl}?tags=${newTags.join(",")}${sortOption !== "order" ? `&sort=${sortOption}` : ""}`
                  : sortOption !== "order"
                    ? `${baseUrl}?sort=${sortOption}`
                    : baseUrl;
                return (
                  <Link
                    key={tag}
                    href={href}
                    className={`tag-pill rounded-full border px-3 py-1.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${
                      isActive ? "active font-medium" : ""
                    }`}
                    style={{
                      borderColor: isActive ? "var(--color-accent-emerald)" : "var(--color-border)",
                      background: isActive ? "rgba(16,185,129,0.15)" : "transparent",
                      color: isActive ? "var(--color-accent-emerald)" : "var(--color-text-muted)",
                    }}
                    aria-pressed={isActive}
                    aria-label={`タグ「${tag}」でフィルター`}
                  >
                    {tag}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {questions.length === 0 ? (
        <p className="mt-6 text-[var(--color-text-muted)]">問題がありません。</p>
      ) : (
        <ul
          className="question-tiles mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
