"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";

export function QuestionEditorClient({
  workbookId,
  keyParam,
  question,
}: {
  workbookId: string;
  keyParam: string;
  question: Question | null;
}) {
  const [title, setTitle] = useState(question?.title ?? "");
  const [type, setType] = useState(question?.type ?? "python-analysis");
  const [difficulty, setDifficulty] = useState(question?.difficulty ?? "初級");
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [status, setStatus] = useState<"draft" | "published">(question?.status ?? "draft");
  const [problemStatement, setProblemStatement] = useState(question?.problem_statement ?? "");
  const [initialCode, setInitialCode] = useState(question?.initial_code ?? "");
  const [validationJson, setValidationJson] = useState(
    question?.validation
      ? JSON.stringify(question.validation, null, 2)
      : '{"method":"value_match","expected_value":0}'
  );
  const [watchVariables, setWatchVariables] = useState(
    Array.isArray(question?.watchVariables)
      ? question.watchVariables.join(", ")
      : "ans"
  );
  const [dataset, setDataset] = useState((question as { dataset?: string })?.dataset ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const keyQuery = `?key=${encodeURIComponent(keyParam)}`;
  const backUrl = `/admin/${workbookId}${keyQuery}`;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setMessage(null);
      let validation: unknown;
      try {
        validation = JSON.parse(validationJson);
      } catch {
        setMessage({ type: "error", text: "validation は有効な JSON にしてください。" });
        setSaving(false);
        return;
      }
      const body = {
        id: question?.id ?? `q${Date.now()}`,
        title,
        type,
        difficulty,
        explanation: explanation || undefined,
        status,
        order: question?.order ?? 0,
        problem_statement: problemStatement || undefined,
        initial_code: initialCode || undefined,
        validation,
        watchVariables: watchVariables
          ? watchVariables.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        dataset: dataset || undefined,
      };
      const url = question
        ? `/api/admin/workbooks/${workbookId}/questions/${question.id}${keyQuery}`
        : `/api/admin/workbooks/${workbookId}/questions${keyQuery}`;
      const method = question ? "PUT" : "POST";
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMessage({
            type: "error",
            text: (data as { message?: string }).message ?? "保存に失敗しました。",
          });
          setSaving(false);
          return;
        }
        setMessage({ type: "ok", text: "保存しました。" });
        window.location.href = backUrl;
        return;
      } catch {
        setMessage({ type: "error", text: "通信エラー" });
      }
      setSaving(false);
    },
    [
      question,
      workbookId,
      keyParam,
      title,
      type,
      difficulty,
      explanation,
      status,
      problemStatement,
      initialCode,
      validationJson,
      watchVariables,
      dataset,
      backUrl,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="python-analysis">python-analysis</option>
        </select>
      </div>
      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
          難易度
        </label>
        <input
          id="difficulty"
          type="text"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="explanation" className="block text-sm font-medium text-gray-700">
          解説
        </label>
        <textarea
          id="explanation"
          rows={2}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-700">拡張フィールド（データ分析）</span>
        <label htmlFor="problem_statement" className="mt-2 block text-sm text-gray-600">
          問題文（problem_statement）
        </label>
        <textarea
          id="problem_statement"
          rows={2}
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
        <label htmlFor="initial_code" className="mt-2 block text-sm text-gray-600">
          初期コード（initial_code）
        </label>
        <textarea
          id="initial_code"
          rows={2}
          value={initialCode}
          onChange={(e) => setInitialCode(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 font-mono text-sm"
        />
        <label htmlFor="dataset" className="mt-2 block text-sm text-gray-600">
          データセット（dataset）
        </label>
        <input
          id="dataset"
          type="text"
          value={dataset}
          onChange={(e) => setDataset(e.target.value)}
          placeholder="file_name, url/path"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
        <label htmlFor="validation" className="mt-2 block text-sm text-gray-600">
          validation（JSON）
        </label>
        <textarea
          id="validation"
          rows={3}
          value={validationJson}
          onChange={(e) => setValidationJson(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 font-mono text-sm"
        />
        <label htmlFor="watchVariables" className="mt-2 block text-sm text-gray-600">
          watchVariables（カンマ区切り）
        </label>
        <input
          id="watchVariables"
          type="text"
          value={watchVariables}
          onChange={(e) => setWatchVariables(e.target.value)}
          placeholder="ans, p_value"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-700">ステータス</span>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => setStatus("draft")}
            className={`rounded px-3 py-1.5 text-sm ${
              status === "draft" ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            下書き
          </button>
          <button
            type="button"
            onClick={() => setStatus("published")}
            className={`rounded px-3 py-1.5 text-sm ${
              status === "published" ? "bg-blue-200" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            公開
          </button>
        </div>
      </div>
      {message && (
        <p
          role="alert"
          className={message.type === "error" ? "text-red-600" : "text-green-700"}
        >
          {message.text}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <Link
          href={backUrl}
          className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
