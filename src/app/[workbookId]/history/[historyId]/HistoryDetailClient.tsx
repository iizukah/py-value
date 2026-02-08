"use client";

/* CD-023: history-detail-tile, history-detail-problem, history-detail-user-answer-body, ReTry ボタン＋アイコン */

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/histories/${historyId}`, {
      headers: { "X-Client-Id": clientId },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [workbookId, historyId]);

  if (loading) return <p className="mt-4 text-[var(--color-text-muted)]">読み込み中...</p>;
  if (!history) return <p className="mt-4 text-[var(--color-text-muted)]">履歴が見つかりません。</p>;

  const userAnswerText = formatUserAnswer(history.userAnswer);

  return (
    <div className="history-detail-tile mt-4 max-w-2xl">
      <div
        className="card rounded-[var(--radius-md)] border p-4"
        style={{ backgroundColor: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
      >
        <p className="text-sm text-[var(--color-text-muted)]">問題 ID: {history.questionId}</p>
        <p className="mt-2 font-semibold text-[var(--color-text)]">
          結果: {history.isCorrect !== undefined ? (history.isCorrect ? "合格" : "不合格") : "—"}
        </p>
        <div className="history-detail-user-answer mt-4">
          <span className="label mb-1 block text-[11px] uppercase text-[var(--color-text-muted)]">userAnswer</span>
          <pre
            className="history-detail-user-answer-body overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-sm)] border p-3 font-mono text-[13px]"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            {userAnswerText || "—"}
          </pre>
        </div>
        {history.judgedAt && (
          <p className="history-detail-judged mt-2 text-[13px] text-[var(--color-text-muted)]">
            <span className="label">JudgedAt</span> {new Date(history.judgedAt).toLocaleString("ja-JP")}
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
