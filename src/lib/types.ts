/**
 * DATA-01 共有型・DATA-02 プラグイン拡張（EXER 第一版）
 * 参照: docs/01_specs/03_contracts/DATA-01_shared_types_and_schemas.md
 *       docs/01_specs/03_contracts/plugins/DATA-02_plugin_python_analysis.md
 */

export type QuestionStatus = "draft" | "published";

export interface QuestionBase {
  id: string;
  title: string;
  type: string;
  category?: string;
  difficulty?: string;
  explanation?: string;
  tags?: string[];
  status: QuestionStatus;
  order?: number;
  favoriteCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Workbook {
  id: string;
  title: string;
  description?: string;
  historyLimit?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** DATA-02: value_match 用（初回は ans のみ） */
export interface ValidationValueMatch {
  method: "value_match";
  expected_value?: number | number[];
  tolerance?: { atol?: number; rtol?: number };
}

export interface PythonAnalysisValidation {
  method: "value_match" | "script" | "ml_test";
  expected_value?: number | number[];
  tolerance?: { atol?: number; rtol?: number };
  baseline_value?: number;
  hidden_test_script?: string;
  hint?: string;
}

/** データ分析プラグイン用 userAnswer */
export interface PythonAnalysisUserAnswer {
  cells?: { id: string; content: string }[];
}

/** JudgeResult - 判定アダプタが返す型（DATA-02） */
export interface JudgeResult {
  isCorrect: boolean;
  message?: string;
  details?: {
    kind?: "value_match" | "script" | "ml_test" | "timeout" | "runtime_error" | "judge_error";
    expected?: unknown;
    actual?: unknown;
    correlation?: number;
    accuracy?: number;
  };
}

/** Question = QuestionBase + プラグイン拡張（python-analysis） */
export interface PythonAnalysisQuestionExtension {
  problem_statement?: string;
  initial_code?: string;
  validation?: PythonAnalysisValidation;
  watchVariables?: string[];
}

/** ストレージでは workbookId を持つ（フラットな questions コレクション） */
export interface Question extends QuestionBase, PythonAnalysisQuestionExtension {
  workbookId?: string;
}

/** DATA-01 §2.3 履歴 */
export type HistoryStatus = "draft" | "submitted";

export interface History {
  id: string;
  workbookId: string;
  questionId: string;
  clientId: string;
  status: HistoryStatus;
  userAnswer: Record<string, unknown>;
  isCorrect?: boolean;
  judgedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/** DATA-01 §2.4 下書き（1 問題 1 件上書き） */
export interface Draft {
  id: string;
  workbookId: string;
  questionId: string;
  clientId: string;
  userAnswer: Record<string, unknown>;
  updatedAt: string;
}

/** DATA-01 §2.5 お気に入り（モデル B: count で +1/-1、0 で削除） */
export interface Favorite {
  id: string;
  workbookId: string;
  questionId: string;
  clientId: string;
  count: number;
  updatedAt: string;
}
