/**
 * DraftRepository インターフェース（ARC-01, DATA-01 §2.4）
 * 1 問題 1 件で上書き保存。
 */

import type { Draft } from "@/lib/types";

export interface DraftRepository {
  get(workbookId: string, questionId: string, clientId: string): Promise<Draft | null>;
  save(draft: Draft): Promise<void>;
  /** API-021: 指定 workbook + client で下書きがある questionId 一覧 */
  listQuestionIds(workbookId: string, clientId: string): Promise<string[]>;
}
