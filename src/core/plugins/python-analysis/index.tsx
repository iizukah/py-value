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
    <div className="space-y-4 rounded border border-gray-200 p-4">
      {question.problem_statement && (
        <div>
          <h3 className="text-lg font-medium">問題</h3>
          <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2 text-sm">
            {question.problem_statement}
          </pre>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">コード</label>
        <textarea
          className="mt-1 w-full rounded border border-gray-300 p-2 font-mono text-sm"
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
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {displayJudging ? "採点中..." : "実行・採点"}
        </button>
      </div>
      {displayResult && (
        <div
          className="rounded border border-gray-200 bg-white p-4 shadow-sm"
          data-sc="SC-003"
          role="region"
          aria-label="採点結果"
        >
          <p className="mb-1 text-sm font-medium text-gray-500">採点結果</p>
          <div
            className={`mb-3 inline-block rounded px-2 py-1 text-sm font-semibold ${
              displayResult.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {displayResult.isCorrect ? "Passed" : "Fail"}
          </div>
          {displayResult.message && (
            <p className="mb-4 text-sm text-gray-700">{displayResult.message}</p>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={handleRun}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Retry
            </button>
            {showCompleteLink === true && workbookId && (
              <Link
                href={`/${workbookId}/complete`}
                className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
