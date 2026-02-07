"use client";

/**
 * データ分析プラグイン Renderer（ARC-02）
 * ワークスペース UI: エディタ・実行ボタン・採点結果表示
 */

import { useState, useCallback } from "react";
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
}

export default function PythonAnalysisPlugin({
  question,
  userAnswer: initialAnswer,
  onAnswerChange,
  judgeResult: externalJudgeResult,
  isJudging: externalIsJudging,
}: PythonAnalysisPluginProps) {
  const cells = (initialAnswer as PythonAnalysisUserAnswer)?.cells ?? [
    { id: "1", content: question.initial_code ?? "" },
  ];
  const [code, setCode] = useState(cells[0]?.content ?? question.initial_code ?? "");
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(externalJudgeResult ?? null);
  const [isJudging, setIsJudging] = useState(false);

  const handleRun = useCallback(async () => {
    setIsJudging(true);
    setJudgeResult(null);
    try {
      const result = await runJudge(question, {
        cells: [{ id: "1", content: code }],
      });
      setJudgeResult(result);
    } finally {
      setIsJudging(false);
    }
  }, [question, code]);

  const displayResult = externalJudgeResult ?? judgeResult;
  const displayJudging = externalIsJudging ?? isJudging;

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
          className={`rounded p-3 ${
            displayResult.isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">{displayResult.isCorrect ? "Passed" : "Fail"}</p>
          {displayResult.message && <p className="text-sm">{displayResult.message}</p>}
        </div>
      )}
    </div>
  );
}
