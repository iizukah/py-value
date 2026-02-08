"use client";

/**
 * FR-F025, F026, F027, F009 / CD-009～015: 問題一覧 mock 準拠（ソートボタン・tag-pill・question-tile・円形バッジ・btn-favorite-block・Try）
 */

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDownUp, Signal, Type, Heart, Award, XCircle, CircleDashed, Play, Bookmark, ChevronDown, ChevronUp, SlidersHorizontal, ArrowUp, ArrowDown } from "lucide-react";
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

/** API-021: 下書きがある questionId 一覧（DD-008, DD-009） */
function useDraftSet(workbookId: string) {
  const [draftSet, setDraftSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/drafts`, { headers: { "X-Client-Id": clientId } })
      .then((res) => (res.ok ? res.json() : { questionIds: [] }))
      .then((data: { questionIds?: string[] }) => {
        const ids = Array.isArray(data?.questionIds) ? data.questionIds : [];
        setDraftSet(new Set(ids));
      })
      .finally(() => setLoading(false));
  }, [workbookId]);

  return { draftSet, loading };
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
  hasDraft,
  onFavoriteToggle,
  toggling,
}: {
  workbookId: string;
  question: QuestionItem;
  baseUrl: string;
  status: "pass" | "fail" | "none";
  isFavorited: boolean;
  favoriteCount: number;
  hasDraft: boolean;
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
      className="question-tile flex min-h-[300px] min-w-0 flex-col rounded-[var(--radius-lg)] border p-4 text-left"
      style={{
        minWidth: "var(--tile-min-width)",
        maxWidth: "100%",
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
      <div className="tile-footer mt-auto flex w-full min-w-0 flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!toggling) onFavoriteToggle();
          }}
          disabled={toggling}
          className="btn-favorite-block inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold no-underline transition-colors hover:-translate-y-0.5 disabled:opacity-50"
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
        {hasDraft ? (
          <Link
            href={`${baseUrl}/questions/${question.id}`}
            className="btn btn-ghost inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold text-[var(--color-accent-emerald)] no-underline hover:bg-[rgba(16,185,129,0.12)]"
            style={{ borderColor: "rgba(16,185,129,0.4)" }}
            aria-label="下書きを開く"
          >
            <Bookmark size={14} aria-hidden />
            Draft
          </Link>
        ) : (
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold opacity-50 cursor-not-allowed"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
            aria-label="下書きなし"
          >
            <Bookmark size={14} aria-hidden />
            Draft
          </span>
        )}
        <Link
          href={`${baseUrl}/questions/${question.id}`}
          className="btn btn-primary inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-white no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, var(--color-accent-emerald) 0%, #0d9488 100%)",
            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
          }}
        >
          <Play size={14} aria-hidden />
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
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "all";
  const difficultyParam = searchParams.get("difficulty") ?? "all";
  const sortDirParam = searchParams.get("dir") ?? "asc";
  const [questionList, setQuestionList] = useState<QuestionItem[]>(questions);
  const questionIds = questionList.map((q) => q.id);
  const { statusByQuestion, loading: statusLoading } = useQuestionStatuses(workbookId, questionIds);
  const { favoritedSet, loading: favLoading, refresh } = useFavoritedSet(workbookId);
  const { draftSet } = useDraftSet(workbookId);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuestionList(questions);
  }, [questions]);

  useEffect(() => {
    setVisibleCount(12);
  }, [statusParam, difficultyParam, sortOption, sortDirParam, tagsParam ?? ""]);

  const filteredByStatus = useCallback(
    (list: QuestionItem[]) => {
      if (statusParam === "all") return list;
      return list.filter((q) => {
        const s = statusByQuestion[q.id] ?? "none";
        if (statusParam === "not_attempted") return s === "none";
        if (statusParam === "not_passed") return s === "none" || s === "fail";
        if (statusParam === "passed") return s === "pass";
        return true;
      });
    },
    [statusParam, statusByQuestion]
  );
  const filteredByDifficulty = useCallback(
    (list: QuestionItem[]) => {
      if (difficultyParam === "all") return list;
      return list.filter((q) => (q.difficulty ?? "初級") === difficultyParam);
    },
    [difficultyParam]
  );
  const filteredQuestionsBase = filteredByDifficulty(filteredByStatus(questionList));
  const filteredQuestions = sortDirParam === "desc" ? [...filteredQuestionsBase].reverse() : filteredQuestionsBase;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visibleCount >= filteredQuestions.length) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisibleCount((n) => Math.min(n + 6, filteredQuestions.length));
      },
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, filteredQuestions.length]);

  const buildQuery = (overrides: { sort?: string; tags?: string; status?: string; difficulty?: string; dir?: string }) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (overrides.sort !== undefined) (overrides.sort === "order" ? qs.delete("sort") : qs.set("sort", overrides.sort));
    if (overrides.tags !== undefined) (overrides.tags ? qs.set("tags", overrides.tags) : qs.delete("tags"));
    if (overrides.status !== undefined) (overrides.status === "all" ? qs.delete("status") : qs.set("status", overrides.status));
    if (overrides.difficulty !== undefined) (overrides.difficulty === "all" ? qs.delete("difficulty") : qs.set("difficulty", overrides.difficulty));
    if (overrides.dir !== undefined) (overrides.dir === "asc" ? qs.delete("dir") : qs.set("dir", overrides.dir));
    const s = qs.toString();
    return s ? `${baseUrl}?${s}` : baseUrl;
  };

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
        .then(() => {
          refresh();
          const sort = searchParams.get("sort") ?? "order";
          const tags = searchParams.get("tags") ?? "";
          const qs = new URLSearchParams();
          if (sort !== "order") qs.set("sort", sort);
          if (tags) qs.set("tags", tags);
          return fetch(`/api/workbooks/${workbookId}/questions?${qs.toString()}`).then((r) => (r.ok ? r.json() : []));
        })
        .then((list: QuestionItem[]) => {
          if (Array.isArray(list)) setQuestionList(list);
        })
        .finally(() => setTogglingId(null));
    },
    [workbookId, favoritedSet, refresh, searchParams]
  );

  const currentTags = tagsParam ? tagsParam.replace(/^&tags=/, "").split(",").map((s) => s.trim()) : [];

  const visibleQuestions = filteredQuestions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredQuestions.length;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="typography-page-title mb-6 text-[var(--color-text)]">{workbookTitle}：問題一覧</h1>

      <div className="list-sort card mb-6 rounded-[var(--radius-md)] border overflow-hidden" style={{ backgroundColor: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-inset"
          style={{ color: "var(--color-text)" }}
          onClick={() => setFilterCollapsed((c) => !c)}
          aria-expanded={!filterCollapsed}
          aria-controls="filter-content"
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-[var(--color-text)]">
            <SlidersHorizontal size={18} aria-hidden />
            ソート・フィルター
          </span>
          {filterCollapsed ? <ChevronDown size={18} aria-hidden /> : <ChevronUp size={18} aria-hidden />}
        </button>
        <div id="filter-content" className={filterCollapsed ? "hidden" : "border-t p-3"} style={{ borderColor: "var(--glass-border)" }}>
          <span className="label mb-1 block text-[11px] uppercase text-[var(--color-text-muted)]">ソート</span>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {sortLinks.map(({ label, value }) => {
              const Icon = SORT_ICONS[value];
              const isActive = sortOption === value;
              const href = buildQuery({ sort: value });
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
            <Link
              href={buildQuery({ dir: sortDirParam === "asc" ? "desc" : "asc" })}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${
                sortDirParam === "desc"
                  ? "border-[var(--color-accent-emerald)] bg-[rgba(16,185,129,0.15)] text-[var(--color-accent-emerald)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-text)]"
              }`}
              aria-label={sortDirParam === "asc" ? "昇順（クリックで降順）" : "降順（クリックで昇順）"}
            >
              {sortDirParam === "asc" ? <ArrowUp size={16} aria-hidden /> : <ArrowDown size={16} aria-hidden />}
            </Link>
          </div>
          <span className="label mt-3 block text-[11px] uppercase text-[var(--color-text-muted)]">ステータス</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { label: "全て", value: "all" },
              { label: "未挑戦", value: "not_attempted" },
              { label: "未合格", value: "not_passed" },
              { label: "合格", value: "passed" },
            ].map(({ label, value }) => {
              const isActive = statusParam === value;
              const href = buildQuery({ status: value });
              return (
                <Link
                  key={value}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${isActive ? "border-[var(--color-accent-emerald)] bg-[rgba(16,185,129,0.15)] text-[var(--color-accent-emerald)]" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-text)]"}`}
                  aria-pressed={isActive}
                  aria-label={`ステータス: ${label}`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <span className="label mt-3 block text-[11px] uppercase text-[var(--color-text-muted)]">難易度</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {["all", "初級", "中級", "上級"].map((value) => {
              const isActive = difficultyParam === value;
              const href = buildQuery({ difficulty: value });
              return (
                <Link
                  key={value}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${isActive ? "border-[var(--color-accent-emerald)] bg-[rgba(16,185,129,0.15)] text-[var(--color-accent-emerald)]" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-text)]"}`}
                  aria-pressed={isActive}
                  aria-label={`難易度: ${value === "all" ? "全て" : value}`}
                >
                  {value === "all" ? "全て" : value}
                </Link>
              );
            })}
          </div>
          {uniqueTags.length > 0 && (
            <>
              <span className="label mt-3 block text-[11px] uppercase text-[var(--color-text-muted)]">タグ</span>
              <div className="tag-filter-row mt-2 flex flex-wrap gap-2">
                {uniqueTags.map((tag) => {
                  const isActive = currentTags.includes(tag);
                  const newTags = isActive ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
                  const href = buildQuery({ tags: newTags.length ? newTags.join(",") : "" });
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
      </div>

      {filteredQuestions.length === 0 ? (
        <p className="mt-6 text-[var(--color-text-muted)]">問題がありません。</p>
      ) : (
        <>
          <ul
            className="question-tiles mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "var(--space-4)" }}
            aria-busy={statusLoading || favLoading}
          >
            {visibleQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                workbookId={workbookId}
                question={q}
                baseUrl={baseUrl}
                status={statusByQuestion[q.id] ?? "none"}
                isFavorited={favoritedSet.has(q.id)}
                favoriteCount={q.favoriteCount ?? 0}
                hasDraft={draftSet.has(q.id)}
                onFavoriteToggle={() => handleFavoriteToggle(q.id)}
                toggling={togglingId === q.id}
              />
            ))}
          </ul>
          {hasMore && <div ref={sentinelRef} className="h-4 w-full" aria-hidden />}
        </>
      )}
    </div>
  );
}
