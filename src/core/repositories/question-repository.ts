/**
 * QuestionRepository インターフェース（ARC-01）
 * 参照: docs/01_specs/02_architecture/ARC-01_system_design.md
 */

import type { Question } from "@/lib/types";

export interface ListQuestionsOptions {
  workbookId: string;
  sort?: "order" | "difficulty" | "title" | "favorites";
  tags?: string[];
}

export interface QuestionRepository {
  listByWorkbookId(options: ListQuestionsOptions): Promise<Question[]>;
  getById(workbookId: string, questionId: string): Promise<Question | null>;
  /** 管理用: 下書き含む全問題一覧 */
  listAllByWorkbookId(workbookId: string): Promise<Question[]>;
  /** 管理用: 問題作成 */
  create(question: Question): Promise<Question>;
  /** 管理用: 問題更新（status 含む） */
  update(workbookId: string, questionId: string, data: Partial<Question>): Promise<Question | null>;
  /** 管理用: 問題削除 */
  delete(workbookId: string, questionId: string): Promise<boolean>;
}
