"use client";

/* CD-022: history-table, バッジ 44px, 一覧へ戻るボタン＋アイコン (mock.html SC-005) */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, XCircle, Eye, ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/histories`, {
      headers: { "X-Client-Id": clientId },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [workbookId]);

  if (loading) return <p className="mt-4 text-[var(--color-text-muted)]">読み込み中...</p>;
  if (list.length === 0) return <p className="mt-4 text-[var(--color-text-muted)]">履歴はありません。</p>;

  return (
    <>
      <div
        className="card rounded-[var(--radius-md)] border p-3"
        style={{ backgroundColor: "var(--glass-bg)", borderColor: "var(--glass-border)", maxWidth: 720, margin: "0 auto" }}
      >
        <span className="label mb-2 block text-[11px] uppercase text-[var(--color-text-muted)]">
          履歴一覧
        </span>
        <table className="history-table w-full border-collapse rounded-[var(--radius-md)] overflow-hidden">
          <thead>
            <tr>
              <th className="border border-[var(--glass-border)] p-3 text-left font-semibold" style={{ backgroundColor: "var(--glass-bg)" }}>
                問題
              </th>
              <th className="border border-[var(--glass-border)] p-3 text-left font-semibold" style={{ backgroundColor: "var(--glass-bg)" }}>
                結果
              </th>
              <th className="border border-[var(--glass-border)] p-3 text-left font-semibold" style={{ backgroundColor: "var(--glass-bg)" }}>
                日時
              </th>
              <th className="border border-[var(--glass-border)] p-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((h) => (
              <tr key={h.id} className="transition-colors hover:bg-[rgba(255,255,255,0.04)]">
                <td className="border border-[var(--glass-border)] p-3 text-[var(--color-text)]">
                  <Link href={`/${workbookId}/history/${h.id}`} className="text-[var(--color-accent-emerald)] no-underline hover:underline">
                    問題 {h.questionId}
                  </Link>
                </td>
                <td className="border border-[var(--glass-border)] p-3">
                  <span
                    className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      h.isCorrect ? "badge-pass" : "badge-fail"
                    }`}
                    style={
                      h.isCorrect
                        ? {
                            background: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.35)",
                          }
                        : {
                            background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.3)",
                          }
                    }
                    aria-label={h.isCorrect ? "合格" : "不合格"}
                  >
                    {h.isCorrect ? <Award size={22} aria-hidden /> : <XCircle size={22} aria-hidden />}
                  </span>
                </td>
                <td className="border border-[var(--glass-border)] p-3 text-[var(--color-text-muted)] text-sm">
                  {h.judgedAt ? new Date(h.judgedAt).toLocaleString("ja-JP") : h.createdAt ? new Date(h.createdAt).toLocaleString("ja-JP") : "—"}
                </td>
                <td className="border border-[var(--glass-border)] p-3">
                  <Link
                    href={`/${workbookId}/history/${h.id}`}
                    className="btn btn-ghost inline-flex items-center gap-1 rounded border px-2 py-1 text-sm no-underline transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    <Eye size={14} aria-hidden />
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="btn-history-back-wrap mt-6 text-center">
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
    </>
  );
}
