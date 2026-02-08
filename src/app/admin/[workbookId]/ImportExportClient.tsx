"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export function ImportExportClient({
  workbookId,
  keyParam,
}: {
  workbookId: string;
  keyParam: string;
}) {
  const [importMessage, setImportMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [exportMessage, setExportMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyQuery = `?key=${encodeURIComponent(keyParam)}`;

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(null);
    let json: unknown;
    try {
      json = JSON.parse(await file.text());
    } catch {
      setImportMessage({ type: "error", text: "有効な JSON ファイルを選択してください。" });
      return;
    }
    const questions = Array.isArray(json) ? json : (json as { questions?: unknown[] }).questions;
    if (!Array.isArray(questions)) {
      setImportMessage({ type: "error", text: "JSON は配列、または { questions: 配列 } 形式にしてください。" });
      return;
    }
    try {
      const res = await fetch(`/api/admin/workbooks/${workbookId}/import${keyQuery}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questions),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errors = (data as { errors?: string[] }).errors;
        setImportMessage({
          type: "error",
          text: errors?.length ? errors.join(" ") : (data as { message?: string }).message ?? "インポートに失敗しました。",
        });
        return;
      }
      const count = (data as { imported?: number }).imported ?? questions.length;
      setImportMessage({ type: "ok", text: `${count} 件をインポートしました。` });
    } catch {
      setImportMessage({ type: "error", text: "通信エラー" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleExport() {
    setExportMessage(null);
    setExportBlob(null);
    try {
      const res = await fetch(`/api/admin/workbooks/${workbookId}/export${keyQuery}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExportMessage({
          type: "error",
          text: (data as { message?: string }).message ?? "エクスポートに失敗しました。",
        });
        return;
      }
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
      setExportBlob(blob);
      setExportMessage({ type: "ok", text: "エクスポートしました。下のリンクからダウンロードできます。" });
    } catch {
      setExportMessage({ type: "error", text: "通信エラー" });
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div data-cp="CP-013">
        <h2 className="text-sm font-medium text-gray-700">インポート（ファイル選択）</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="mt-1 block text-sm"
          aria-label="JSON ファイルを選択"
        />
        {importMessage && (
          <p
            role="alert"
            className={`mt-2 text-sm ${importMessage.type === "error" ? "text-red-600" : "text-green-700"}`}
          >
            {importMessage.text}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-700">エクスポート</h2>
        <button
          type="button"
          onClick={handleExport}
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          エクスポート実行
        </button>
        {exportMessage && (
          <p
            role="alert"
            className={`mt-2 text-sm ${exportMessage.type === "error" ? "text-red-600" : "text-green-700"}`}
          >
            {exportMessage.text}
          </p>
        )}
        {exportBlob && (
          <a
            href={URL.createObjectURL(exportBlob)}
            download={`${workbookId}-questions.json`}
            className="mt-2 inline-block text-sm text-blue-600 hover:underline"
          >
            ダウンロード
          </a>
        )}
      </div>
      <div>
        <Link
          href={`/admin/${workbookId}${keyQuery}`}
          className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
