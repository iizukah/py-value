"use client";

/**
 * データ分析プラグイン Renderer（ARC-02）
 * CD-016～020: 3-pane ワークスペース、ツールバー、採点結果 mock 準拠
 * FR-F010: 全問正解時に完了画面（SC-004）への導線を表示
 */

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Send, Award, XCircle, RotateCcw, Play, Plus, Trash2, Undo2, Heart } from "lucide-react";
/** DD-006: 採点結果後の Retry はツールバーのみ。押下で状態リセットのみ（ユーザーが再入力し解答送信） */
import type { Question } from "@/lib/types";
import type { JudgeResult } from "@/lib/types";
import type { PythonAnalysisUserAnswer } from "@/lib/types";
import { runJudge, getCombinedCode, runCodeAndGetVariables, getPyodide } from "./judge";
import { getOrCreateClientId } from "@/lib/client-id";
import { CodeInputWithHighlight } from "./CodeInputWithHighlight";

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
  const initialCells = (initialAnswer as PythonAnalysisUserAnswer)?.cells ?? [
    { id: "1", content: question.initial_code ?? "" },
  ];
  const [cells, setCells] = useState<{ id: string; content: string }[]>(initialCells);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(externalJudgeResult ?? null);
  const [isJudging, setIsJudging] = useState(false);
  const [showCompleteLink, setShowCompleteLink] = useState<boolean | null>(null);
  const [resultTileVisible, setResultTileVisible] = useState(false);
  const [draftSavedMessage, setDraftSavedMessage] = useState(false);
  /** DD-010: セル Run 後の変数（Variable Watcher 表示用） */
  const [lastRunVariables, setLastRunVariables] = useState<Record<string, unknown>>({});
  /** セル Run の結果をセル直下に表示（stdout/stderr/error）。DATA-02 §4.2 */
  const [cellRunOutput, setCellRunOutput] = useState<Record<string, { stdout?: string; stderr?: string; error?: string }>>({});
  /** セル Run 実行中は他セルの Run を無効化 */
  const [isCellRunning, setIsCellRunning] = useState(false);
  /** FR-P003: Matplotlib 描画結果（base64） */
  const [plotImageBase64, setPlotImageBase64] = useState<string | null>(null);
  /** DD-021: 採点結果表示時の問題一覧（ランダム最大10問）。Retry で非表示。中央ペイン表示用に order/difficulty/tags/problem_statement を含む */
  const [resultQuestionList, setResultQuestionList] = useState<
    { id: string; title: string; order?: number; difficulty?: string; tags?: string[]; problem_statement?: string }[]
  >([]);
  /** DD-023: Pyodide 準備完了まで全画面オーバーレイ表示 */
  const [pyodideReady, setPyodideReady] = useState(false);
  /** Retry 隣のお気に入り: 現在問題がお気に入りか */
  const [isCurrentFavorited, setIsCurrentFavorited] = useState(false);

  const notifyAnswer = useCallback(
    (next: { id: string; content: string }[]) => {
      setCells(next);
      onAnswerChange?.({ cells: next });
    },
    [onAnswerChange]
  );

  useEffect(() => {
    const next = (initialAnswer as PythonAnalysisUserAnswer)?.cells;
    if (next && Array.isArray(next) && next.length > 0) {
      setCells(next.map((c) => ({ id: c.id, content: c.content ?? "" })));
    }
  }, [initialAnswer]);

  const handleRun = useCallback(async () => {
    setIsJudging(true);
    setJudgeResult(null);
    setResultTileVisible(false);
    const userAnswer = { cells };
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
  }, [question, cells, workbookId, questionId]);

  const handleDraftSave = useCallback(() => {
    if (!workbookId || !questionId) return;
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/questions/${questionId}/draft`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": clientId,
      },
      body: JSON.stringify({ userAnswer: { cells } }),
    }).then((r) => {
      if (r.ok) {
        setDraftSavedMessage(true);
        setTimeout(() => setDraftSavedMessage(false), 2500);
      }
    });
  }, [workbookId, questionId, cells]);

  const displayResult = externalJudgeResult ?? judgeResult;
  const displayJudging = externalIsJudging ?? isJudging;

  const handleRetryReset = useCallback(() => {
    setJudgeResult(null);
    setResultTileVisible(false);
    setResultQuestionList([]);
  }, []);

  /** DD-024: リセット — セル・採点・変数・プロットを初期状態に戻す */
  const handleReset = useCallback(() => {
    const initial = [{ id: "1", content: question.initial_code ?? "" }];
    setCells(initial);
    notifyAnswer(initial);
    setJudgeResult(null);
    setResultTileVisible(false);
    setResultQuestionList([]);
    setLastRunVariables({});
    setCellRunOutput({});
    setPlotImageBase64(null);
  }, [question.initial_code, notifyAnswer]);

  /** DD-023: mount 時に Pyodide をプリロードし、完了までオーバーレイ表示 */
  useEffect(() => {
    getPyodide()
      .then(() => setPyodideReady(true))
      .catch(() => setPyodideReady(true));
  }, []);

  /** DD-021: 採点結果表示時に問題一覧を取得。10問は個別 GET で order/difficulty/tags/problem_statement を取得 */
  useEffect(() => {
    if (!workbookId || !displayResult) {
      setResultQuestionList([]);
      return;
    }
    fetch(`/api/workbooks/${workbookId}/questions`)
      .then((r) => (r.ok ? r.json() : []))
      .then(async (list: { id: string; title?: string }[]) => {
        const arr = Array.isArray(list) ? list : [];
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        const ids = shuffled.slice(0, 10).map((q) => q.id);
        const clientId = typeof window !== "undefined" ? getOrCreateClientId() : "";
        const withDetails = await Promise.all(
          ids.map((id) =>
            fetch(`/api/workbooks/${workbookId}/questions/${id}`, {
              headers: clientId ? { "X-Client-Id": clientId } : {},
            })
              .then((r) => (r.ok ? r.json() : { id, title: `問題 ${id}` }))
              .then((q: { id: string; title?: string; order?: number; difficulty?: string; tags?: string[]; problem_statement?: string }) => ({
                id: q.id,
                title: q.title ?? `問題 ${q.id}`,
                order: q.order,
                difficulty: q.difficulty,
                tags: q.tags,
                problem_statement: q.problem_statement,
              }))
          )
        );
        setResultQuestionList(withDetails);
      })
      .catch(() => setResultQuestionList([]));
  }, [workbookId, displayResult]);

  /** Retry 隣のお気に入り: 採点結果表示時に GET favorites で現在問題がお気に入りか取得 */
  useEffect(() => {
    if (!workbookId || !questionId || !displayResult) {
      setIsCurrentFavorited(false);
      return;
    }
    const clientId = getOrCreateClientId();
    fetch(`/api/workbooks/${workbookId}/favorites`, { headers: { "X-Client-Id": clientId } })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { questionId?: string }[]) => {
        const arr = Array.isArray(list) ? list : [];
        setIsCurrentFavorited(arr.some((f) => f.questionId === questionId));
      })
      .catch(() => setIsCurrentFavorited(false));
  }, [workbookId, questionId, displayResult]);

  /** Retry 隣のお気に入り: トグル（POST 追加 / DELETE 解除） */
  const handleToggleFavorite = useCallback(async () => {
    if (!workbookId || !questionId) return;
    const clientId = getOrCreateClientId();
    const url = `/api/workbooks/${workbookId}/questions/${questionId}/favorite`;
    if (isCurrentFavorited) {
      await fetch(url, { method: "DELETE", headers: { "X-Client-Id": clientId } });
      setIsCurrentFavorited(false);
    } else {
      await fetch(url, { method: "POST", headers: { "X-Client-Id": clientId } });
      setIsCurrentFavorited(true);
    }
  }, [workbookId, questionId, isCurrentFavorited]);

  /** セル単位 Run（stdout/stderr をセル下に、Variable Watcher と Result Plot を更新） */
  const handleRunCell = useCallback(
    async (cellIndex: number) => {
      setIsCellRunning(true);
      const combined = getCombinedCode({
        cells: cells.slice(0, cellIndex + 1).map((c) => ({ id: c.id, content: c.content })),
      });
      const watchNames = question.watchVariables?.length ? question.watchVariables : ["ans"];
      try {
        const result = await runCodeAndGetVariables(combined, watchNames);
        const cellId = cells[cellIndex]?.id ?? "";
        setLastRunVariables(result.variables);
        setCellRunOutput((prev) => ({
          ...prev,
          [cellId]: {
            stdout: result.stdout,
            stderr: result.stderr,
            error: result.error,
          },
        }));
        if (result.plotBase64) setPlotImageBase64(result.plotBase64);
      } finally {
        setIsCellRunning(false);
      }
    },
    [cells, question.watchVariables]
  );

  const addCell = useCallback(() => {
    const next = [...cells, { id: crypto.randomUUID(), content: "" }];
    notifyAnswer(next);
  }, [cells, notifyAnswer]);

  const deleteCell = useCallback(
    (index: number) => {
      if (cells.length <= 1) return;
      const next = cells.filter((_, i) => i !== index);
      notifyAnswer(next);
      setCellRunOutput((prev) => {
        const id = cells[index]?.id;
        if (!id) return prev;
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    },
    [cells, notifyAnswer]
  );

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
    <>
      {/* DD-023: Pyodide 準備完了まで全画面ローディング */}
      {!pyodideReady && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6"
          style={{ background: "var(--color-bg-main)" }}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="stats-loader flex h-[60px] w-[120px] items-end gap-1" style={{ gap: 4 }}>
            {[0.2, 0.5, 0.8, 1, 0.8, 0.5, 0.2].map((h, i) => (
              <div
                key={i}
                className="stats-bar rounded-t"
                style={{
                  width: 8,
                  height: `${h * 100}%`,
                  background: "linear-gradient(to top, var(--color-accent-blue), var(--color-accent-emerald))",
                  animation: "stats-grow 1.5s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">準備中...</p>
        </div>
      )}
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
                {/* DD-022: 問題一覧は中央ペインに表示するため左ペインから削除 */}
              </>
            )}
          </div>
        </div>
        )}
      </div>

      {/* CD-016: 中央ペイン = セル編集 or 問題一覧（採点結果時）+ CD-017 ツールバー */}
      <div className="pane flex flex-col">
        <div
          className="workspace-toolbar mb-4 flex flex-wrap items-center justify-between gap-2"
        >
          <div />
          <div className="workspace-toolbar-actions flex gap-2">
            <div className="inline-flex items-center gap-2">
              {/* DD-024: リセットボタン（下書き保存の左） */}
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)]"
                style={{ borderColor: "var(--color-border)" }}
                aria-label="リセット"
              >
                <Undo2 size={16} aria-hidden />
                リセット
              </button>
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
              {draftSavedMessage && (
                <span className="text-sm text-[var(--color-accent-emerald)]" role="status" aria-live="polite">
                  保存しました
                </span>
              )}
            </div>
            <div className="inline-flex items-center gap-2">
              {/* DD-025: Retry の隣にお気に入り（採点結果表示時のみ） */}
              {displayResult && workbookId && questionId && (
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`btn btn-ghost inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-[rgba(255,255,255,0.06)] ${
                    isCurrentFavorited ? "text-red-400" : "text-[var(--color-text)]"
                  }`}
                  style={{ borderColor: "var(--color-border)" }}
                  aria-label={isCurrentFavorited ? "お気に入り解除" : "お気に入りに追加"}
                >
                  <Heart size={16} aria-hidden fill={isCurrentFavorited ? "currentColor" : "none"} />
                  {isCurrentFavorited ? "お気に入り済み" : "お気に入り"}
                </button>
              )}
              <button
                type="button"
                onClick={displayResult ? handleRetryReset : handleRun}
                disabled={displayJudging}
                className="btn btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, var(--color-accent-emerald) 0%, #0d9488 100%)",
                  boxShadow: "var(--shadow-btn-primary)",
                }}
                aria-label={displayResult ? "Retry（状態リセット）" : "解答送信"}
              >
                {displayResult ? <RotateCcw size={16} aria-hidden /> : <Send size={16} aria-hidden />}
                {displayResult ? "Retry" : "解答送信"}
              </button>
            </div>
          </div>
        </div>
        {/* DD-022: 「コード」ラベル削除 */}
        {displayResult && resultQuestionList.length > 0 && workbookId ? (
          /* DD-021: 採点結果時は中央ペインに問題一覧（CHALLENGE・難易度・タグ・問題文省略） */
          <div className="flex flex-1 flex-col gap-3 overflow-auto">
            <span className="label mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              問題一覧
            </span>
            <ul className="flex flex-col gap-3">
              {resultQuestionList.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/${workbookId}/questions/${q.id}`}
                    className="block rounded-[var(--radius-md)] border p-3 no-underline transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    <div className="tile-subtitle mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent-emerald)]">
                      CHALLENGE {(q.order ?? 0).toString().padStart(2, "0")}
                    </div>
                    <div className="tile-title-row flex items-center gap-2">
                      <span className="font-bold text-[var(--color-text)]">{q.title}</span>
                      {q.difficulty && (
                        <span className="rounded border px-2 py-0.5 text-[11px]" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                    {q.tags && q.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {q.tags.map((t) => (
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
                    {q.problem_statement && (
                      <p className="mt-2 line-clamp-2 text-[12px] text-[var(--color-text-muted)]">
                        {q.problem_statement}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
        <div className="cell-group-ws relative flex flex-1 flex-col gap-4">
          {(isCellRunning || displayJudging) && (
            <div
              className="absolute inset-0 z-[100] flex flex-col items-center justify-center rounded-[var(--radius-sm)]"
              style={{ background: "var(--color-bg-main)" }}
              aria-live="polite"
              aria-busy="true"
            >
              <div className="stats-loader flex h-[60px] w-[120px] items-end gap-1" style={{ gap: 4 }}>
                {[0.2, 0.5, 0.8, 1, 0.8, 0.5, 0.2].map((h, i) => (
                  <div
                    key={i}
                    className="stats-bar rounded-t"
                    style={{
                      width: 8,
                      height: `${h * 100}%`,
                      background: "linear-gradient(to top, var(--color-accent-blue), var(--color-accent-emerald))",
                      animation: "stats-grow 1.5s ease-in-out infinite",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <div className="relative mt-5 h-0.5 w-[200px] overflow-hidden bg-[rgba(16,185,129,0.2)]">
                <div className="scanning-line-bar" />
              </div>
              <p className="mt-6 text-[10px] font-mono tracking-widest text-[var(--color-accent-emerald)]">
                {displayJudging ? "採点中..." : "実行中..."}
              </p>
            </div>
          )}
        <div className="cell-group-ws flex flex-1 flex-col gap-4">
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              className="cell-group-ws rounded-[var(--radius-sm)] border-l-4 border-transparent"
              style={{
                borderLeftColor: "var(--color-border)",
                transition: "border-color 0.2s",
              }}
            >
              <div
                className="cell-box min-h-[80px] rounded-[var(--radius-sm)] border p-3 font-mono text-[13px]"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-bg-main)",
                  color: "var(--color-text)",
                }}
              >
                <CodeInputWithHighlight
                  value={cell.content}
                  onChange={(value) => {
                    const next = cells.map((c, i) =>
                      i === index ? { ...c, content: value } : c
                    );
                    notifyAnswer(next);
                  }}
                  placeholder="コードを入力..."
                  aria-label={`セル ${index + 1}`}
                  rows={4}
                  style={{ backgroundColor: "var(--color-bg-main)" }}
                />
              </div>
              <div
                className="cell-actions mt-2 flex flex-wrap items-center gap-2"
                aria-label="セル操作"
              >
                <button
                  type="button"
                  onClick={() => handleRunCell(index)}
                  disabled={isCellRunning}
                  className="btn-cell-run inline-flex items-center gap-1.5 rounded border px-2 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-50 disabled:pointer-events-none"
                  style={{ borderColor: "var(--color-border)" }}
                  aria-label={`セル ${index + 1} を実行`}
                >
                  <Play size={14} aria-hidden />
                  Run
                </button>
                <button
                  type="button"
                  onClick={addCell}
                  className="btn-add-cell inline-flex items-center gap-1.5 rounded border px-2 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)]"
                  style={{ borderColor: "var(--color-border)" }}
                  aria-label="セルを追加"
                >
                  <Plus size={14} aria-hidden />
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => deleteCell(index)}
                  disabled={cells.length <= 1}
                  className="btn-delete-cell inline-flex items-center gap-1.5 rounded border px-2 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-40 disabled:pointer-events-none"
                  style={{ borderColor: "var(--color-border)" }}
                  aria-label={`セル ${index + 1} を削除`}
                >
                  <Trash2 size={14} aria-hidden />
                  削除
                </button>
              </div>
              {cellRunOutput[cell.id] && (
                <div
                  className="cell-output mt-2 rounded border px-3 py-2 font-mono text-[12px]"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "var(--color-text-muted)",
                  }}
                  role="status"
                >
                  {cellRunOutput[cell.id].error && (
                    <p className="whitespace-pre-wrap text-red-400">{cellRunOutput[cell.id].error}</p>
                  )}
                  {cellRunOutput[cell.id].stderr && (
                    <p className="mt-1 whitespace-pre-wrap text-red-400/90">{cellRunOutput[cell.id].stderr}</p>
                  )}
                  {cellRunOutput[cell.id].stdout && (
                    <pre className="mt-1 whitespace-pre-wrap text-[var(--color-text-muted)]">
                      {String(cellRunOutput[cell.id].stdout)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
        )}
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
          {Object.keys(lastRunVariables).length === 0 ? (
            <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
              （セル Run または解答送信後に表示）
            </p>
          ) : (
            <pre className="font-mono text-[11px] text-[var(--color-text)] whitespace-pre-wrap break-all">
              {Object.entries(lastRunVariables).map(
                ([k, v]) => `${k} = ${JSON.stringify(v)}`
              ).join("\n")}
            </pre>
          )}
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
          {plotImageBase64 ? (
            <img
              src={`data:image/png;base64,${plotImageBase64}`}
              alt="Matplotlib 出力"
              className="max-h-[280px] w-auto max-w-full object-contain"
            />
          ) : (
            <>
              <span className="label block text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
                プロット
              </span>
              <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                （plt.show() 実行後に表示）
              </p>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
