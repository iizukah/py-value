"use client";

/* CD-023: history-detail-tile, history-detail-problem, history-detail-user-answer-body, ReTry ボタン＋アイコン */

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, Award, XCircle } from "lucide-react";
import { getOrCreateClientId } from "@/lib/client-id";

interface HistoryDetail {
  id: string;
  workbookId: string;
  questionId: string;
  clientId: string;
  status: string;
  isCorrect?: boolean;
  judgedAt?: string;
  createdAt: string;
  userAnswer?: Record<string, unknown>;
}

interface QuestionMeta {
  id: string;
  title: string;
  problem_statement?: string;
}

function formatUserAnswer(ua: Record<string, unknown> | undefined): string {
  if (!ua) return "";
  if (ua.cells && Array.isArray(ua.cells)) {
    return (ua.cells as { content?: string }[]).map((c) => c.content ?? "").join("\n");
  }
  return JSON.stringify(ua, null, 2);
}

export function HistoryDetailClient({
  workbookId,
  historyId,
}: {
  workbookId: string;
  historyId: string;
}) {
  const [history, setHistory] = useState<HistoryDetail | null>(null);
  const [question, setQuestion] = useState<QuestionMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/histories/${historyId}`, {
      headers: { "X-Client-Id": clientId },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((h) => {
        setHistory(h);
        if (h?.questionId) {
          return fetch(`/api/workbooks/${workbookId}/questions/${h.questionId}`).then((r) => (r.ok ? r.json() : null));
        }
        return null;
      })
      .then((q) => setQuestion(q ?? null))
      .finally(() => setLoading(false));
  }, [workbookId, historyId]);

  if (loading) return <p className="mt-4 text-[var(--color-text-muted)]">読み込み中...</p>;
  if (!history) return <p className="mt-4 text-[var(--color-text-muted)]">履歴が見つかりません。</p>;

  const userAnswerText = formatUserAnswer(history.userAnswer);
  const isPass = history.isCorrect === true;

  return (
    <div className="history-detail-tile mt-4 max-w-2xl">
      <div
        className="card rounded-[var(--radius-md)] border p-4"
        style={{ backgroundColor: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
      >
        <div className="result-badge-block mb-4 flex flex-row items-center gap-3">
          <span
            className={`result-status-badge inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
              isPass ? "badge-pass" : "badge-fail"
            }`}
            aria-label={isPass ? "合格" : "不合格"}
          >
            {isPass ? <Award size={24} strokeWidth={2} aria-hidden /> : <XCircle size={24} strokeWidth={2} aria-hidden />}
          </span>
          <span className="result-status-label text-base">
            {history.isCorrect !== undefined ? (history.isCorrect ? "合格" : "不合格") : "—"}
          </span>
        </div>
        {question?.title && (
          <p className="text-sm font-semibold text-[var(--color-text)]">問題: {question.title}</p>
        )}
        {question?.problem_statement && (
          <div className="history-detail-problem mt-4 rounded-[var(--radius-sm)] border p-3 text-[14px] leading-relaxed" style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255,255,255,0.03)" }}>
            <span className="label mb-1 block text-[11px] uppercase text-[var(--color-text-muted)]">問題文</span>
            <div className="whitespace-pre-wrap text-[var(--color-text)]">{question.problem_statement}</div>
          </div>
        )}
        <p className="mt-4 text-sm font-semibold text-[var(--color-text)]">
          <span className="text-[var(--color-text-muted)] font-normal">問題 ID: </span>{history.questionId}
        </p>
        <div className="history-detail-user-answer mt-4">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            <span className="text-[var(--color-text-muted)] font-normal">あなたの回答</span>
          </p>
          <pre
            className="history-detail-user-answer-body mt-1 overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-sm)] border p-3 font-mono text-[13px] text-[var(--color-text)]"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            {userAnswerText || "—"}
          </pre>
        </div>
        {history.judgedAt && (
          <p className="history-detail-judged mt-4 text-sm font-semibold text-[var(--color-text)]">
            <span className="text-[var(--color-text-muted)] font-normal">受験日時: </span>{new Date(history.judgedAt).toLocaleString("ja-JP")}
          </p>
        )}
        <div className="mt-4 flex justify-end">
          <Link
            href={`/${workbookId}/questions/${history.questionId}`}
            className="btn btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, var(--color-accent-emerald) 0%, #0d9488 100%)",
              boxShadow: "var(--shadow-btn-primary)",
            }}
          >
            <RotateCcw size={16} aria-hidden />
            ReTry
          </Link>
        </div>
      </div>
    </div>
  );
}
