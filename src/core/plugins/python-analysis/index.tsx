"use client";

/**
 * データ分析プラグイン Renderer（ARC-02）
 * CD-016～020: 3-pane ワークスペース、ツールバー、採点結果 mock 準拠
 * FR-F010: 全問正解時に完了画面（SC-004）への導線を表示
 */

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Send, Award, XCircle, RotateCcw } from "lucide-react";
import type { Question } from "@/lib/types";
import type { JudgeResult } from "@/lib/types";
import type { PythonAnalysisUserAnswer } from "@/lib/types";
import { runJudge } from "./judge";
import { getOrCreateClientId } from "@/lib/client-id";

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
  const [resultTileVisible, setResultTileVisible] = useState(false);

  const handleRun = useCallback(async () => {
    setIsJudging(true);
    setJudgeResult(null);
    setResultTileVisible(false);
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
      setTimeout(() => setResultTileVisible(true), 100);
    } finally {
      setIsJudging(false);
    }
  }, [question, code, workbookId, questionId]);

  const handleDraftSave = useCallback(() => {
    if (!workbookId || !questionId) return;
    const clientId = getOrCreateClientId();
    const userAnswer = { cells: [{ id: "1", content: code }] };
    fetch(`/api/workbooks/${workbookId}/questions/${questionId}/draft`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": clientId,
      },
      body: JSON.stringify({ userAnswer }),
    }).then((r) => {
      if (r.ok) {
        // optional: toast or brief "保存しました"
      }
    });
  }, [workbookId, questionId, code]);

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

  const order = (question as { order?: number }).order ?? 1;
  const difficulty = (question as { difficulty?: string }).difficulty ?? "初級";
  const tags = (question as { tags?: string[] }).tags ?? [];

  return (
    <div className="three-pane mt-6" style={{ minHeight: "420px" }}>
      {/* CD-016: 左ペイン = 問題 */}
      <div className="pane workspace-problem-pane">
        <div className="workspace-problem-tile">
          <div
            className="tile-header mb-2 rounded-[var(--radius-md)] border px-3 py-2"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.22) 0%, rgba(13,148,136,0.14) 100%)",
              borderColor: "rgba(16,185,129,0.4)",
            }}
          >
            <div className="tile-subtitle mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent-emerald)]">
              CHALLENGE {String(order).padStart(2, "0")}
            </div>
            <div className="tile-title-row flex items-center gap-3">
              <span className="tile-display-title text-[1rem] font-bold text-[var(--color-text)]">
                {question.title}
              </span>
            </div>
            {tags.length > 0 && (
              <div className="tile-tags mt-2 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border px-2 py-0.5 text-[11px]"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      color: "var(--color-accent-emerald)",
                      borderColor: "rgba(16,185,129,0.3)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div
            className="workspace-problem-readability rounded-[var(--radius-md)] border p-3 text-[14px] leading-relaxed"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            {question.problem_statement || "（問題文なし）"}
          </div>
        </div>

        {/* CD-018, CD-019, CD-020: 採点結果ブロック（ワークスペース内） */}
        {(displayJudging || displayResult) && (
        <div
          className={`mt-4 rounded-[var(--radius-md)] border p-3 ${
            displayResult
              ? displayResult.isCorrect
                ? "workspace-judge-success"
                : "workspace-judge-fail"
              : "border-[var(--color-border)]"
          }`}
          role="region"
          aria-label="採点結果"
        >
          <span className="label mb-2 block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            採点結果
          </span>
          <div className="result-medal-wrap">
            {displayJudging && (
              <div className="result-grading-loading" aria-live="polite">
                <div className="result-grading-spinner" aria-hidden />
                <span className="result-grading-text">採点中</span>
              </div>
            )}
            {!displayJudging && displayResult && (
              <>
                <div className="result-badge-block" aria-live="polite">
                  <span
                    className={`result-status-badge ${displayResult.isCorrect ? "badge-pass" : "badge-fail"}`}
                    aria-label={displayResult.isCorrect ? "合格" : "不合格"}
                  >
                    {displayResult.isCorrect ? (
                      <Award size={56} strokeWidth={2} aria-hidden />
                    ) : (
                      <XCircle size={56} strokeWidth={2} aria-hidden />
                    )}
                  </span>
                  <span className="result-status-label">
                    {displayResult.isCorrect ? "Passed" : "Fail"}
                  </span>
                </div>
                <div
                  className={`result-tile ${resultTileVisible ? "result-tile-visible" : ""}`}
                  style={{ opacity: resultTileVisible ? 1 : 0 }}
                >
                  {displayResult.message && (
                    <p className="mb-3 text-sm text-[var(--color-text)]">{displayResult.message}</p>
                  )}
                  <div className="tile-footer flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleRun}
                      className="btn btn-ghost inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)]"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <RotateCcw size={16} aria-hidden />
                      Retry
                    </button>
                    {showCompleteLink === true && workbookId && (
                      <Link
                        href={`/${workbookId}/complete`}
                        className="btn btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white no-underline hover:opacity-90"
                        style={{
                          background: "linear-gradient(135deg, var(--color-accent-emerald) 0%, #0d9488 100%)",
                          boxShadow: "var(--shadow-btn-primary)",
                        }}
                        aria-label="完了画面へ"
                      >
                        完了画面へ
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        )}
      </div>

      {/* CD-016: 中央ペイン = セル編集 + CD-017 ツールバー */}
      <div className="pane flex flex-col">
        <div
          className="workspace-toolbar mb-4 flex flex-wrap items-center justify-between gap-2"
        >
          <div />
          <div className="workspace-toolbar-actions flex gap-2">
            <button
              type="button"
              onClick={handleDraftSave}
              className="btn btn-ghost inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)]"
              style={{ borderColor: "var(--color-border)" }}
              aria-label="下書き保存"
            >
              <Bookmark size={16} aria-hidden />
              下書き保存
            </button>
            <button
              type="button"
              onClick={handleRun}
              disabled={displayJudging}
              className="btn btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, var(--color-accent-emerald) 0%, #0d9488 100%)",
                boxShadow: "var(--shadow-btn-primary)",
              }}
              aria-label="解答送信"
            >
              <Send size={16} aria-hidden />
              解答送信
            </button>
          </div>
        </div>
        <div
          className="cell-group-ws flex-1 rounded-[var(--radius-sm)] border-l-4 border-transparent pb-3"
          style={{
            borderBottom: "1px solid var(--color-border)",
            transition: "border-color 0.2s",
          }}
        >
          <label className="label mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            コード
          </label>
          <div
            className="cell-box mt-2 min-h-[120px] rounded-[var(--radius-sm)] border p-3 font-mono text-[13px]"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-bg-main)",
              color: "var(--color-text)",
            }}
          >
            <textarea
              className="h-full w-full resize-y bg-transparent font-mono text-[13px] text-[var(--color-text)] outline-none"
              rows={12}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                onAnswerChange?.({ cells: [{ id: "1", content: e.target.value }] });
              }}
              spellCheck={false}
              aria-label="コード入力"
            />
          </div>
        </div>
      </div>

      {/* CD-016: 右ペイン = Variable Watcher + Plot */}
      <div className="pane flex flex-col">
        <div
          className="workspace-variable-watcher rounded-[var(--radius-md)] border p-3"
          style={{
            background: "rgba(1, 4, 9, 0.9)",
            borderColor: "var(--color-border)",
          }}
        >
          <span className="label mb-2 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Variable Watcher
          </span>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            （実行後に表示）
          </p>
        </div>
        <div
          className="workspace-plot-header mt-4 rounded-t-[var(--radius-md)] border border-b-0 p-3 text-sm font-semibold text-[var(--color-text)]"
          style={{ borderColor: "var(--color-border)" }}
        >
          Result Plot
        </div>
        <div
          className="workspace-plot-body rounded-b-[var(--radius-md)] border p-4"
          style={{
            borderColor: "var(--color-border)",
            minHeight: "120px",
          }}
        >
          <span className="label block text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
            プロット
          </span>
          <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
            （Matplotlib 出力）
          </p>
        </div>
      </div>
    </div>
  );
}
