/**
 * DraftService（ARC-01, TC-005）
 * 下書きの取得・保存（1 問題 1 件上書き）。
 */

import { getDraftRepository } from "@/core/repositories";
import type { Draft } from "@/lib/types";

export async function getDraft(
  workbookId: string,
  questionId: string,
  clientId: string
): Promise<Draft | null> {
  const repo = getDraftRepository();
  return repo.get(workbookId, questionId, clientId);
}

export async function saveDraft(
  workbookId: string,
  questionId: string,
  clientId: string,
  userAnswer: Record<string, unknown>
): Promise<Draft> {
  const repo = getDraftRepository();
  const id = `draft-${workbookId}-${questionId}-${clientId}`;
  const draft: Draft = {
    id,
    workbookId,
    questionId,
    clientId,
    userAnswer,
    updatedAt: new Date().toISOString(),
  };
  await repo.save(draft);
  return draft;
}
