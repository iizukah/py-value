/**
 * HistoryService（ARC-01, TC-006）
 * 履歴の保存・一覧・詳細。ワークブック単位の件数上限を守る。
 */

import { getHistoryRepository } from "@/core/repositories";
import { getWorkbookRepository } from "@/core/repositories";
import type { History } from "@/lib/types";

const DEFAULT_HISTORY_LIMIT = 10;

export async function saveHistory(history: History): Promise<void> {
  const repo = getHistoryRepository();
  await repo.save(history);
  const workbookRepo = getWorkbookRepository();
  const workbook = await workbookRepo.getById(history.workbookId);
  const limit = workbook?.historyLimit ?? DEFAULT_HISTORY_LIMIT;
  await repo.enforceLimit(history.workbookId, history.clientId, limit);
}

export async function listHistories(
  workbookId: string,
  clientId: string
): Promise<History[]> {
  const repo = getHistoryRepository();
  return repo.listByWorkbookAndClient(workbookId, clientId);
}

export async function getHistoryById(
  workbookId: string,
  historyId: string,
  clientId: string
): Promise<History | null> {
  const repo = getHistoryRepository();
  return repo.getById(workbookId, historyId, clientId);
}
