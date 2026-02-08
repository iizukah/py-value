"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";

interface WorkbookInfo {
  id: string;
  title?: string;
  historyLimit?: number;
}

export function AdminDashboardClient({
  keyParam,
  workbookId,
}: {
  keyParam: string;
  workbookId: string;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [workbook, setWorkbook] = useState<WorkbookInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyLimitInput, setHistoryLimitInput] = useState<string>("");
  const [savingHistoryLimit, setSavingHistoryLimit] = useState(false);
  const q = new URLSearchParams({ key: keyParam }).toString();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [questionsRes, workbookRes] = await Promise.all([
          fetch(`/api/admin/workbooks/${workbookId}/questions?${q}`, { cache: "no-store" }),
          fetch(`/api/admin/workbooks/${workbookId}?${q}`, { cache: "no-store" }),
        ]);
        if (!questionsRes.ok) {
          if (questionsRes.status === 401) {
            if (!cancelled) setError("キーが無効です。");
            return;
          }
          if (!cancelled) setError("問題一覧の取得に失敗しました。");
          return;
        }
        const data = await questionsRes.json();
        if (!cancelled) setQuestions(Array.isArray(data) ? data : []);
        if (workbookRes.ok) {
          const wb = await workbookRes.json();
          if (!cancelled) {
            setWorkbook(wb);
            setHistoryLimitInput(String(wb.historyLimit ?? "10"));
          }
        }
      } catch {
        if (!cancelled) setError("通信エラー");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workbookId, q]);

  const base = `/admin/${workbookId}`;
  const keyQuery = `?key=${encodeURIComponent(keyParam)}`;

  async function handleDelete(questionId: string) {
    if (!confirm(`「${questions.find((x) => x.id === questionId)?.title ?? questionId}」を削除しますか？`)) return;
    try {
      const res = await fetch(
        `/api/admin/workbooks/${workbookId}/questions/${questionId}?${q}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        setError("削除に失敗しました。");
        return;
      }
      setQuestions((prev) => prev.filter((x) => x.id !== questionId));
    } catch {
      setError("通信エラー");
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6" data-sc="SC-007" role="region" aria-label="管理ダッシュボード">
      <h1 className="text-xl font-bold">管理ダッシュボード</h1>
      <nav className="mt-4 flex flex-wrap gap-4 text-sm" aria-label="管理ナビ">
        <Link
          href={`${base}${keyQuery}`}
          className="font-medium text-blue-600 hover:underline"
        >
          問題一覧
        </Link>
        <Link
          href={`${base}/import${keyQuery}`}
          className="text-gray-600 hover:text-gray-900"
        >
          インポート/エクスポート
        </Link>
        <Link
          href={`${base}/datasets${keyQuery}`}
          className="text-gray-600 hover:text-gray-900"
        >
          データセットアップロード
        </Link>
      </nav>
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <Link
          href={`${base}/questions/new${keyQuery}`}
          className="inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          新規作成
        </Link>
        {workbook && (
          <div className="flex items-center gap-2" role="group" aria-label="履歴の最大件数">
            <label htmlFor="history-limit" className="text-sm font-medium text-gray-700">
              履歴の最大件数
            </label>
            <input
              id="history-limit"
              type="number"
              min={0}
              max={999}
              value={historyLimitInput}
              onChange={(e) => setHistoryLimitInput(e.target.value)}
              className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
              aria-describedby="history-limit-desc"
            />
            <button
              type="button"
              disabled={savingHistoryLimit}
              onClick={async () => {
                const n = parseInt(historyLimitInput, 10);
                if (Number.isNaN(n) || n < 0) return;
                setSavingHistoryLimit(true);
                try {
                  const res = await fetch(`/api/admin/workbooks/${workbookId}?${q}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ historyLimit: n }),
                  });
                  if (res.ok) {
                    const wb = await res.json();
                    setWorkbook(wb);
                  }
                } finally {
                  setSavingHistoryLimit(false);
                }
              }}
              className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {savingHistoryLimit ? "保存中..." : "保存"}
            </button>
            <span id="history-limit-desc" className="text-xs text-gray-500">
              ユーザーごとの履歴保持件数
            </span>
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-600">問題一覧（下書き含む）:</p>
      {loading && <p className="mt-2 text-gray-500">読み込み中...</p>}
      {error && (
        <p className="mt-2 text-red-600" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && (
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-200 px-3 py-2 text-left font-medium">
                  タイトル
                </th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-medium">
                  ステータス
                </th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-medium">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-gray-500">
                    問題がありません。
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="border-b border-gray-100">
                    <td className="px-3 py-2">{q.title}</td>
                    <td className="px-3 py-2">{q.status === "published" ? "公開" : "下書き"}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`${base}/questions/${q.id}/edit${keyQuery}`}
                        className="text-blue-600 hover:underline"
                      >
                        編集
                      </Link>
                      {" | "}
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        className="text-red-600 hover:underline"
                        aria-label={`${q.title} を削除`}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
