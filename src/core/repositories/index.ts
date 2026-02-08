/**
 * データソース切り替え（ARC-01-005, INFRA-01 §4.2）
 * DATA_SOURCE=lowdb | firestore で Repository 実装を切り替える。
 */

import type { WorkbookRepository } from "./workbook-repository";
import type { QuestionRepository } from "./question-repository";
import type { DraftRepository } from "./draft-repository";
import type { HistoryRepository } from "./history-repository";
import type { FavoriteRepository } from "./favorite-repository";
import { createLowdbWorkbookRepository } from "./lowdb/workbook-repository";
import { createLowdbQuestionRepository } from "./lowdb/question-repository";
import { createLowdbDraftRepository } from "./lowdb/draft-repository";
import { createLowdbHistoryRepository } from "./lowdb/history-repository";
import { createLowdbFavoriteRepository } from "./lowdb/favorite-repository";
import { createFirestoreWorkbookRepository } from "./firestore/workbook-repository";
import { createFirestoreQuestionRepository } from "./firestore/question-repository";
import { createFirestoreHistoryRepository } from "./firestore/history-repository";
import { createFirestoreFavoriteRepository } from "./firestore/favorite-repository";

export type { WorkbookRepository } from "./workbook-repository";
export type { QuestionRepository, ListQuestionsOptions } from "./question-repository";
export type { DraftRepository } from "./draft-repository";
export type { HistoryRepository } from "./history-repository";
export type { FavoriteRepository } from "./favorite-repository";

let cachedWorkbookRepo: WorkbookRepository | null = null;
let cachedQuestionRepo: QuestionRepository | null = null;
let cachedDraftRepo: DraftRepository | null = null;
let cachedHistoryRepo: HistoryRepository | null = null;
let cachedFavoriteRepo: FavoriteRepository | null = null;

function getDataDir(): string {
  const path = process.env.LOWDB_PATH ?? "./data";
  return path;
}

export function getWorkbookRepository(): WorkbookRepository {
  if (cachedWorkbookRepo) return cachedWorkbookRepo;
  const source = process.env.DATA_SOURCE ?? "lowdb";
  if (source === "firestore") {
    cachedWorkbookRepo = createFirestoreWorkbookRepository();
  } else {
    cachedWorkbookRepo = createLowdbWorkbookRepository(getDataDir());
  }
  return cachedWorkbookRepo;
}

export function getQuestionRepository(): QuestionRepository {
  if (cachedQuestionRepo) return cachedQuestionRepo;
  const source = process.env.DATA_SOURCE ?? "lowdb";
  if (source === "firestore") {
    cachedQuestionRepo = createFirestoreQuestionRepository();
  } else {
    cachedQuestionRepo = createLowdbQuestionRepository(getDataDir());
  }
  return cachedQuestionRepo;
}

export function getDraftRepository(): DraftRepository {
  if (cachedDraftRepo) return cachedDraftRepo;
  cachedDraftRepo = createLowdbDraftRepository(getDataDir());
  return cachedDraftRepo;
}

export function getHistoryRepository(): HistoryRepository {
  if (cachedHistoryRepo) return cachedHistoryRepo;
  const source = process.env.DATA_SOURCE ?? "lowdb";
  if (source === "firestore") {
    cachedHistoryRepo = createFirestoreHistoryRepository();
  } else {
    cachedHistoryRepo = createLowdbHistoryRepository(getDataDir());
  }
  return cachedHistoryRepo;
}

export function getFavoriteRepository(): FavoriteRepository {
  if (cachedFavoriteRepo) return cachedFavoriteRepo;
  const source = process.env.DATA_SOURCE ?? "lowdb";
  if (source === "firestore") {
    cachedFavoriteRepo = createFirestoreFavoriteRepository();
  } else {
    cachedFavoriteRepo = createLowdbFavoriteRepository(getDataDir());
  }
  return cachedFavoriteRepo;
}

export function clearRepositoryCache(): void {
  cachedWorkbookRepo = null;
  cachedQuestionRepo = null;
  cachedDraftRepo = null;
  cachedHistoryRepo = null;
  cachedFavoriteRepo = null;
}
