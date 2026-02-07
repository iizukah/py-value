/**
 * QuestionService（ARC-01）
 * 初回は sort=order のみ、tags フィルターは未実装。
 */

import { getQuestionRepository } from "@/core/repositories";
import type { Question } from "@/lib/types";

export async function listQuestions(
  workbookId: string,
  sort: "order" | "difficulty" | "title" | "favorites" = "order"
): Promise<Question[]> {
  const repo = getQuestionRepository();
  return repo.listByWorkbookId({ workbookId, sort });
}

export async function getQuestionById(
  workbookId: string,
  questionId: string
): Promise<Question | null> {
  const repo = getQuestionRepository();
  return repo.getById(workbookId, questionId);
}
