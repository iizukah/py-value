"use client";

/**
 * CD-024: お気に入り一覧をタイル表示（問題一覧と同様）、ヘッダー右に解除、footer に Draft + Try
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Play, Bookmark, Award, XCircle, CircleDashed } from "lucide-react";
import { getOrCreateClientId } from "@/lib/client-id";

interface FavoriteItem {
  id: string;
  workbookId: string;
  questionId: string;
  clientId: string;
  count: number;
}

interface QuestionMeta {
  id: string;
  title: string;
  order?: number;
  tags?: string[];
  excerpt?: string;
  problem_statement?: string;
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

function FavoriteTile({
  workbookId,
  favorite,
  question,
  status,
  hasDraft,
  onRemove,
}: {
  workbookId: string;
  favorite: FavoriteItem;
  question: QuestionMeta | undefined;
  status: "pass" | "fail" | "none";
  hasDraft: boolean;
  onRemove: (e: React.MouseEvent, questionId: string) => void;
}) {
  const order = question?.order ?? 1;
  const title = question?.title ?? `問題 ${favorite.questionId}`;
  const tags = question?.tags ?? [];
  const excerpt = question?.problem_statement?.slice(0, 150) ?? question?.excerpt ?? title;
  const baseUrl = `/${workbookId}`;

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
        className="tile-header mb-2 flex items-start justify-between gap-2 rounded-[var(--radius-md)] border px-3 py-2"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.22) 0%, rgba(13,148,136,0.14) 100%)",
          borderColor: "rgba(16,185,129,0.4)",
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="tile-subtitle mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent-emerald)]">
            CHALLENGE {String(order).padStart(2, "0")}
          </div>
          <div className="tile-title-row flex items-center gap-3">
            <span className="tile-display-title min-w-0 flex-1 text-[1.1rem] font-bold text-[var(--color-text)]">
              {title}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => onRemove(e, favorite.questionId)}
          className="btn btn-ghost shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-text)]"
          style={{ borderColor: "var(--color-border)" }}
          aria-label="お気に入りを解除"
        >
          解除
        </button>
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
        <div
          className="btn-favorite-block inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.04)", color: "#f87171" }}
        >
          <Heart size={16} fill="currentColor" aria-hidden />
          <span className="tile-favorite-count m-0">{favorite.count}</span>
        </div>
        {hasDraft ? (
          <Link
            href={`${baseUrl}/questions/${favorite.questionId}`}
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
          href={`${baseUrl}/questions/${favorite.questionId}`}
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

interface HistoryItem {
  questionId: string;
  status: string;
  isCorrect?: boolean;
  judgedAt?: string;
  createdAt: string;
}

function computeStatusByQuestion(histories: HistoryItem[], questionIds: string[]): Record<string, "pass" | "fail" | "none"> {
  const list = Array.isArray(histories) ? histories : [];
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
  return next;
}

export function FavoritesListClient({ workbookId }: { workbookId: string }) {
  const [list, setList] = useState<FavoriteItem[]>([]);
  const [questions, setQuestions] = useState<QuestionMeta[]>([]);
  const [draftSet, setDraftSet] = useState<Set<string>>(new Set());
  const [statusByQuestion, setStatusByQuestion] = useState<Record<string, "pass" | "fail" | "none">>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = getOrCreateClientId();
    Promise.all([
      fetch(`/api/workbooks/${workbookId}/favorites`, {
        headers: { "X-Client-Id": clientId },
      }).then((res) => (res.ok ? res.json() : [])),
      fetch(`/api/workbooks/${workbookId}/questions`).then((res) => (res.ok ? res.json() : [])),
      fetch(`/api/workbooks/${workbookId}/drafts`, {
        headers: { "X-Client-Id": clientId },
      }).then((res) => (res.ok ? res.json() : { questionIds: [] })),
      fetch(`/api/workbooks/${workbookId}/histories`, {
        headers: { "X-Client-Id": clientId },
      }).then((res) => (res.ok ? res.json() : [])),
    ]).then(([favData, qData, draftData, histories]) => {
      setList(Array.isArray(favData) ? favData : []);
      setQuestions(Array.isArray(qData) ? qData : []);
      const ids = Array.isArray(draftData?.questionIds) ? draftData.questionIds : [];
      setDraftSet(new Set(ids));
      const favIds = (Array.isArray(favData) ? favData : []).map((f: FavoriteItem) => f.questionId);
      setStatusByQuestion(computeStatusByQuestion(histories as HistoryItem[], favIds));
    }).finally(() => setLoading(false));
  }, [workbookId]);

  const load = () => {
    setLoading(true);
    const clientId = getOrCreateClientId();
    Promise.all([
      fetch(`/api/workbooks/${workbookId}/favorites`, {
        headers: { "X-Client-Id": clientId },
      }).then((res) => (res.ok ? res.json() : [])),
      fetch(`/api/workbooks/${workbookId}/questions`).then((res) => (res.ok ? res.json() : [])),
      fetch(`/api/workbooks/${workbookId}/drafts`, {
        headers: { "X-Client-Id": clientId },
      }).then((res) => (res.ok ? res.json() : { questionIds: [] })),
      fetch(`/api/workbooks/${workbookId}/histories`, {
        headers: { "X-Client-Id": clientId },
      }).then((res) => (res.ok ? res.json() : [])),
    ]).then(([favData, qData, draftData, histories]) => {
      setList(Array.isArray(favData) ? favData : []);
      setQuestions(Array.isArray(qData) ? qData : []);
      const ids = Array.isArray(draftData?.questionIds) ? draftData.questionIds : [];
      setDraftSet(new Set(ids));
      const favIds = (Array.isArray(favData) ? favData : []).map((f: FavoriteItem) => f.questionId);
      setStatusByQuestion(computeStatusByQuestion(histories as HistoryItem[], favIds));
    }).finally(() => setLoading(false));
  };

  const remove = (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/questions/${questionId}/favorite`, {
      method: "DELETE",
      headers: { "X-Client-Id": clientId },
    }).then(() => load());
  };

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  if (loading) return <p className="mt-4 text-[var(--color-text-muted)]">読み込み中...</p>;
  if (list.length === 0) return <p className="mt-4 text-[var(--color-text-muted)]">お気に入りはありません。</p>;

  return (
    <ul
      className="question-tiles mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      style={{ gap: "var(--space-4)" }}
    >
      {list.map((f) => (
        <FavoriteTile
          key={f.id}
          workbookId={workbookId}
          favorite={f}
          question={questionMap.get(f.questionId)}
          status={statusByQuestion[f.questionId] ?? "none"}
          hasDraft={draftSet.has(f.questionId)}
          onRemove={remove}
        />
      ))}
    </ul>
  );
}
