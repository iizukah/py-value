"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export function DatasetUploadClient({
  workbookId,
  keyParam,
}: {
  workbookId: string;
  keyParam: string;
}) {
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyQuery = `?key=${encodeURIComponent(keyParam)}`;

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "error", text: "ファイルを選択してください。" });
      return;
    }
    setMessage(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/admin/workbooks/${workbookId}/datasets${keyQuery}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          type: "error",
          text: (data as { message?: string }).message ?? "アップロードに失敗しました。",
        });
        setUploading(false);
        return;
      }
      setMessage({ type: "ok", text: (data as { message?: string }).message ?? "アップロードしました。" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setMessage({ type: "error", text: "通信エラー" });
    }
    setUploading(false);
  }

  return (
    <div className="mt-6 space-y-4" data-cp="CP-014">
      <form onSubmit={handleUpload}>
        <label htmlFor="dataset-file" className="block text-sm font-medium text-gray-700">
          ファイルアップロード
        </label>
        <input
          id="dataset-file"
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="mt-1 block text-sm"
          aria-label="CSV またはテキストファイルを選択"
        />
        <button
          type="submit"
          disabled={uploading}
          className="mt-3 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "アップロード中..." : "アップロード"}
        </button>
      </form>
      {message && (
        <div
          role="alert"
          className={`rounded border p-3 text-sm ${
            message.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}
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
