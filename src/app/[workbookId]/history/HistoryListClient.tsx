"use client";

/* CD-022, DD-003, DD-004: history-table, 問題タイトル表示（クライアントで問題一覧取得）、アイコン＋文字、td 余白 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, XCircle, ArrowLeft, FileCode, Calendar } from "lucide-react";
import { getOrCreateClientId } from "@/lib/client-id";

interface HistoryItem {
  id: string;
  workbookId: string;
  questionId: string;
  clientId: string;
  status: string;
  isCorrect?: boolean;
  judgedAt?: string;
  createdAt: string;
}

export function HistoryListClient({ workbookId }: { workbookId: string }) {
  const [list, setList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [titleByQuestionId, setTitleByQuestionId] = useState<Record<string, string>>({});

  useEffect(() => {
    const clientId = getOrCreateClientId();
    Promise.all([
      fetch(`/api/workbooks/${workbookId}/histories`, { headers: { "X-Client-Id": clientId } }).then((res) => (res.ok ? res.json() : [])),
      fetch(`/api/workbooks/${workbookId}/questions`).then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([histories, questions]) => {
        setList(Array.isArray(histories) ? histories : []);
        const map: Record<string, string> = {};
        (Array.isArray(questions) ? questions : []).forEach((q: { id: string; title?: string }) => {
          if (q.id) map[q.id] = q.title ?? `問題 ${q.id}`;
        });
        setTitleByQuestionId(map);
      })
      .finally(() => setLoading(false));
  }, [workbookId]);

  if (loading) return <p className="mt-4 text-[var(--color-text-muted)]">読み込み中...</p>;
  if (list.length === 0) return <p className="mt-4 text-[var(--color-text-muted)]">履歴はありません。</p>;

  return (
    <div className="mt-6">
      <div
        className="card rounded-[var(--radius-md)] p-4"
        style={{ backgroundColor: "var(--glass-bg)" }}
      >
        <table className="history-table w-full border-collapse rounded-[var(--radius-md)] overflow-hidden text-left">
          <thead>
            <tr>
              <th className="border border-[var(--glass-border)] px-5 py-3 font-semibold text-[var(--color-text)]" style={{ backgroundColor: "var(--glass-bg)" }}>
                <span className="inline-flex items-center gap-2">
                  <FileCode size={16} aria-hidden />
                  問題
                </span>
              </th>
              <th className="border border-[var(--glass-border)] px-5 py-3 font-semibold text-[var(--color-text)]" style={{ backgroundColor: "var(--glass-bg)" }}>
                <span className="inline-flex items-center gap-2">
                  <Award size={16} aria-hidden />
                  結果
                </span>
              </th>
              <th className="border border-[var(--glass-border)] px-5 py-3 font-semibold text-[var(--color-text)]" style={{ backgroundColor: "var(--glass-bg)" }}>
                <span className="inline-flex items-center gap-2">
                  <Calendar size={16} aria-hidden />
                  日時
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((h) => (
              <tr key={h.id} className="transition-colors hover:bg-[rgba(255,255,255,0.04)]">
                <td className="border border-[var(--glass-border)] px-5 py-3 text-[var(--color-text)]">
                  <Link href={`/${workbookId}/history/${h.id}`} className="inline-flex items-center gap-2 text-[var(--color-accent-emerald)] no-underline hover:underline">
                    <FileCode size={14} aria-hidden />
                    {titleByQuestionId[h.questionId] ?? `問題 ${h.questionId}`}
                  </Link>
                </td>
                <td className="border border-[var(--glass-border)] px-5 py-3">
                  <span
                    className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 ${h.isCorrect ? "badge-pass" : "badge-fail"}`}
                    style={
                      h.isCorrect
                        ? { background: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)", color: "#fff", borderColor: "rgba(255,255,255,0.35)" }
                        : { background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }
                    }
                    aria-label={h.isCorrect ? "合格" : "不合格"}
                  >
                    {h.isCorrect ? <Award size={22} aria-hidden /> : <XCircle size={22} aria-hidden />}
                  </span>
                </td>
                <td className="border border-[var(--glass-border)] px-5 py-3 text-sm text-[var(--color-text-muted)]">
                  {h.judgedAt ? new Date(h.judgedAt).toLocaleString("ja-JP") : h.createdAt ? new Date(h.createdAt).toLocaleString("ja-JP") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="btn-history-back-wrap mt-4 flex justify-start">
          <Link
            href={`/${workbookId}`}
            className="btn btn-secondary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] hover:opacity-90"
            style={{
              background: "var(--color-accent-blue)",
              boxShadow: "var(--shadow-btn-secondary)",
            }}
          >
            <ArrowLeft size={16} aria-hidden />
            一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
