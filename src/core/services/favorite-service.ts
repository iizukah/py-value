/**
 * FavoriteService（ARC-01, TC-007）
 * 追加で count+1、解除で count-1、0 で削除。一覧は clientId で絞る。
 */

import { getFavoriteRepository } from "@/core/repositories";
import type { Favorite } from "@/lib/types";

export async function getFavorite(
  workbookId: string,
  questionId: string,
  clientId: string
): Promise<Favorite | null> {
  const repo = getFavoriteRepository();
  return repo.get(workbookId, questionId, clientId);
}

export async function addFavorite(
  workbookId: string,
  questionId: string,
  clientId: string
): Promise<Favorite> {
  const repo = getFavoriteRepository();
  return repo.add(workbookId, questionId, clientId);
}

export async function removeFavorite(
  workbookId: string,
  questionId: string,
  clientId: string
): Promise<Favorite | null> {
  const repo = getFavoriteRepository();
  return repo.remove(workbookId, questionId, clientId);
}

export async function listFavorites(
  workbookId: string,
  clientId: string
): Promise<Favorite[]> {
  const repo = getFavoriteRepository();
  return repo.listByWorkbookAndClient(workbookId, clientId);
}

export async function getFavoriteCount(
  workbookId: string,
  questionId: string
): Promise<number> {
  const repo = getFavoriteRepository();
  return repo.countByQuestion(workbookId, questionId);
}
