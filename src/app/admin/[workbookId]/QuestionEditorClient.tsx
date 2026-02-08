"use client";

/**
 * CD-025, CD-026: 管理画面 入力・ラベル・ボタンを mock の .form-group, .btn に合わせ、WCAG コントラスト
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import { Save, X, FileText, Globe } from "lucide-react";
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
      <div className="form-group">
        <label htmlFor="title">タイトル</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="type">type</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="python-analysis">python-analysis</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="difficulty">難易度</label>
        <input
          id="difficulty"
          type="text"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="explanation">解説</label>
        <textarea
          id="explanation"
          rows={2}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <span className="label block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          拡張フィールド（データ分析）
        </span>
        <div className="form-group">
          <label htmlFor="problem_statement">問題文（problem_statement）</label>
          <textarea
            id="problem_statement"
            rows={2}
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="initial_code">初期コード（initial_code）</label>
          <textarea
            id="initial_code"
            rows={2}
            value={initialCode}
            onChange={(e) => setInitialCode(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="form-group">
          <label htmlFor="dataset">データセット（dataset）</label>
          <input
            id="dataset"
            type="text"
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            placeholder="file_name, url/path"
          />
        </div>
        <div className="form-group">
          <label htmlFor="validation">validation（JSON）</label>
          <textarea
            id="validation"
            rows={3}
            value={validationJson}
            onChange={(e) => setValidationJson(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="form-group">
          <label htmlFor="watchVariables">watchVariables（カンマ区切り）</label>
          <input
            id="watchVariables"
            type="text"
            value={watchVariables}
            onChange={(e) => setWatchVariables(e.target.value)}
            placeholder="ans, p_value"
          />
        </div>
      </div>
      <div className="form-group">
        <span className="label mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          ステータス
        </span>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => setStatus("draft")}
            className={`btn inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${
              status === "draft"
                ? "btn-secondary text-white"
                : "btn-ghost text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)]"
            }`}
            style={
              status === "draft"
                ? { background: "var(--color-accent-blue)", boxShadow: "var(--shadow-btn-secondary)" }
                : { border: "1px solid var(--color-border)", background: "transparent" }
            }
            aria-pressed={status === "draft"}
          >
            <FileText size={14} aria-hidden />
            下書き
          </button>
          <button
            type="button"
            onClick={() => setStatus("published")}
            className={`btn inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${
              status === "published"
                ? "btn-secondary text-white"
                : "btn-ghost text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)]"
            }`}
            style={
              status === "published"
                ? { background: "var(--color-accent-blue)", boxShadow: "var(--shadow-btn-secondary)" }
                : { border: "1px solid var(--color-border)", background: "transparent" }
            }
            aria-pressed={status === "published"}
          >
            <Globe size={14} aria-hidden />
            公開
          </button>
        </div>
      </div>
      {message && (
        <p
          role="alert"
          className={message.type === "error" ? "text-[var(--color-error-text)]" : "text-[var(--color-accent-emerald)]"}
        >
          {message.text}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)]"
          style={{
            background: "linear-gradient(135deg, var(--color-accent-emerald) 0%, #0d9488 100%)",
            boxShadow: "var(--shadow-btn-primary)",
          }}
        >
          <Save size={16} aria-hidden />
          {saving ? "保存中..." : "保存"}
        </button>
        <Link
          href={backUrl}
          className="btn btn-ghost inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-[var(--color-text)] no-underline hover:bg-[rgba(255,255,255,0.06)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)]"
          style={{ borderColor: "var(--color-border)" }}
        >
          <X size={16} aria-hidden />
          キャンセル
        </Link>
      </div>
    </form>
  );
}
