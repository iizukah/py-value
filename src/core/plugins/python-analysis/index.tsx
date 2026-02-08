"use client";

/**
 * データ分析プラグイン Renderer（ARC-02）
 * ワークスペース UI: エディタ・実行ボタン・採点結果表示
 * FR-F010: 全問正解時に完了画面（SC-004）への導線を表示
 */

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import type { JudgeResult } from "@/lib/types";
import type { PythonAnalysisUserAnswer } from "@/lib/types";
import { runJudge } from "./judge";

export interface PythonAnalysisPluginProps {
  question: Question;
  userAnswer?: PythonAnalysisUserAnswer | Record<string, unknown>;
  onAnswerChange?: (answer: Record<string, unknown>) => void;
  onRunJudge?: () => void;
  judgeResult?: JudgeResult | null;
  isJudging?: boolean;
  workbookId?: string;
  questionId?: string;
}

import { getOrCreateClientId } from "@/lib/client-id";

export default function PythonAnalysisPlugin({
  question,
  userAnswer: initialAnswer,
  onAnswerChange,
  judgeResult: externalJudgeResult,
  isJudging: externalIsJudging,
  workbookId,
  questionId,
}: PythonAnalysisPluginProps) {
  const cells = (initialAnswer as PythonAnalysisUserAnswer)?.cells ?? [
    { id: "1", content: question.initial_code ?? "" },
  ];
  const [code, setCode] = useState(cells[0]?.content ?? question.initial_code ?? "");
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(externalJudgeResult ?? null);
  const [isJudging, setIsJudging] = useState(false);
  const [showCompleteLink, setShowCompleteLink] = useState<boolean | null>(null);

  const handleRun = useCallback(async () => {
    setIsJudging(true);
    setJudgeResult(null);
    const userAnswer = { cells: [{ id: "1", content: code }] };
    try {
      const result = await runJudge(question, userAnswer);
      if (workbookId && questionId && typeof window !== "undefined") {
        const clientId = getOrCreateClientId();
        await fetch(
          `/api/workbooks/${workbookId}/questions/${questionId}/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Client-Id": clientId,
            },
            body: JSON.stringify({ userAnswer, judgeResult: result }),
          }
        );
      }
      setJudgeResult(result);
    } finally {
      setIsJudging(false);
    }
  }, [question, code, workbookId, questionId]);

  const displayResult = externalJudgeResult ?? judgeResult;
  const displayJudging = externalIsJudging ?? isJudging;

  useEffect(() => {
    if (!workbookId || !displayResult?.isCorrect) {
      setShowCompleteLink(null);
      return;
    }
    const clientId = getOrCreateClientId();
    Promise.all([
      fetch(`/api/workbooks/${workbookId}/questions`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/workbooks/${workbookId}/histories`, {
        headers: { "X-Client-Id": clientId },
      }).then((r) => (r.ok ? r.json() : [])),
    ]).then(([questions, histories]) => {
      const ids = (Array.isArray(questions) ? questions : []).map((q: { id: string }) => q.id).filter(Boolean);
      const list = Array.isArray(histories) ? histories : [];
      const correctByQuestion: Record<string, boolean> = {};
      for (const h of list) {
        if (h.status === "submitted" && h.isCorrect === true && h.questionId) {
          correctByQuestion[h.questionId] = true;
        }
      }
      const allCorrect = ids.length > 0 && ids.every((id: string) => correctByQuestion[id]);
      setShowCompleteLink(allCorrect);
    });
  }, [workbookId, displayResult?.isCorrect]);

  return (
    <div
      className="space-y-4 rounded-[var(--radius-lg)] border p-4"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-secondary)",
      }}
    >
      {question.problem_statement && (
        <div>
          <h3 className="text-lg font-medium text-[var(--color-text)]">問題</h3>
          <pre
            className="whitespace-pre-wrap rounded-[var(--radius-sm)] p-2 text-sm text-[var(--color-text)]"
            style={{ backgroundColor: "var(--color-bg-main)" }}
          >
            {question.problem_statement}
          </pre>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)]">コード</label>
        <textarea
          className="mt-1 w-full rounded-[var(--radius-sm)] border p-2 font-mono text-sm text-[var(--color-text)]"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg-main)",
          }}
          rows={10}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            onAnswerChange?.({ cells: [{ id: "1", content: e.target.value }] });
          }}
          spellCheck={false}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={displayJudging}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-main)] disabled:opacity-50 hover:opacity-90"
          style={{
            backgroundColor: "var(--color-accent-emerald)",
            boxShadow: "var(--shadow-btn-primary)",
          }}
        >
          {displayJudging ? "採点中..." : "実行・採点"}
        </button>
      </div>
      {displayResult && (
        <div
          className="rounded-[var(--radius-lg)] border p-4"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg-secondary)",
          }}
          data-sc="SC-003"
          role="region"
          aria-label="採点結果"
        >
          <p className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">採点結果</p>
          <div
            className={`mb-3 inline-block rounded-[var(--radius-pill)] px-3 py-1 text-sm font-bold text-white ${
              displayResult.isCorrect
                ? "shadow-[0_0_16px_rgba(16,185,129,0.5)]"
                : "shadow-[0_0_12px_rgba(248,113,113,0.5)]"
            }`}
            style={{
              background: displayResult.isCorrect
                ? "linear-gradient(135deg, #10b981, #0d9488)"
                : "linear-gradient(135deg, #f87171, #dc2626)",
            }}
          >
            {displayResult.isCorrect ? "Passed" : "Fail"}
          </div>
          {displayResult.message && (
            <p className="mb-4 text-sm text-[var(--color-text)]">{displayResult.message}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRun}
              className="rounded-[var(--radius-md)] border px-3 py-1.5 text-sm text-[var(--color-text)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)]"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg-main)",
              }}
            >
              Retry
            </button>
            {showCompleteLink === true && workbookId && (
              <Link
                href={`/${workbookId}/complete`}
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-main)] hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-accent-emerald)",
                  boxShadow: "var(--shadow-btn-primary)",
                }}
                aria-label="完了画面へ"
              >
                完了画面へ
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
