"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";

export function AdminDashboardClient({
  keyParam,
  workbookId,
}: {
  keyParam: string;
  workbookId: string;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const q = new URLSearchParams({ key: keyParam }).toString();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/workbooks/${workbookId}/questions?${q}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          if (res.status === 401) {
            setError("キーが無効です。");
            return;
          }
          setError("問題一覧の取得に失敗しました。");
          return;
        }
        const data = await res.json();
        if (!cancelled) setQuestions(Array.isArray(data) ? data : []);
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
      <div className="mt-6">
        <Link
          href={`${base}/questions/new${keyQuery}`}
          className="inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          新規作成
        </Link>
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
