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
}
