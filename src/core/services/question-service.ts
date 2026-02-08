/**
 * QuestionService（ARC-01）
 * 問題一覧に favoriteCount を含める（API-003）。
 */

import { getQuestionRepository, getFavoriteRepository } from "@/core/repositories";
import type { Question } from "@/lib/types";

export async function listQuestions(
  workbookId: string,
  sort: "order" | "difficulty" | "title" | "favorites" = "order",
  tags?: string[]
): Promise<Question[]> {
  const repo = getQuestionRepository();
  const list = await repo.listByWorkbookId({ workbookId, sort, tags });
  const favRepo = getFavoriteRepository();
  const withCount: Question[] = await Promise.all(
    list.map(async (q) => {
      const count = q.id != null ? await favRepo.countByQuestion(workbookId, q.id) : 0;
      return { ...q, favoriteCount: count };
    })
  );
  return withCount;
}

export async function getQuestionById(
  workbookId: string,
  questionId: string
): Promise<Question | null> {
  const repo = getQuestionRepository();
  return repo.getById(workbookId, questionId);
}
