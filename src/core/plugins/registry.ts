/**
 * プラグインレジストリ（ARC-01-003, FR-F022）
 * registerPlugin / getPlugin
 */

import type { ComponentType } from "react";
import type { Question } from "@/lib/types";
import type { JudgeResult } from "@/lib/types";
import type { PythonAnalysisUserAnswer } from "@/lib/types";

export interface JudgeAdapter {
  runJudge(question: Question, userAnswer: Record<string, unknown>): Promise<JudgeResult>;
}

export interface PluginEntry {
  type: string;
  Component: ComponentType<PluginComponentProps>;
  judgeAdapter: JudgeAdapter;
}

export interface PluginComponentProps {
  question: Question;
  userAnswer?: PythonAnalysisUserAnswer | Record<string, unknown>;
  onAnswerChange?: (answer: Record<string, unknown>) => void;
  onRunJudge?: () => void;
  judgeResult?: JudgeResult | null;
  isJudging?: boolean;
  /** 解答送信 API 用（POST submit）。省略時はプラグイン内で runJudge のみ実行。 */
  workbookId?: string;
  questionId?: string;
}

const registry = new Map<string, PluginEntry>();

export function registerPlugin(
  type: string,
  Component: ComponentType<PluginComponentProps>,
  judgeAdapter: JudgeAdapter
): void {
  registry.set(type, { type, Component, judgeAdapter });
}

export function getPlugin(type: string): PluginEntry | null {
  return registry.get(type) ?? null;
}
