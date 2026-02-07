/**
 * データソース切り替え（ARC-01-005, INFRA-01 §4.2）
 * DATA_SOURCE=lowdb | firestore で Repository 実装を切り替える。
 */

import type { WorkbookRepository } from "./workbook-repository";
import type { QuestionRepository } from "./question-repository";
import { createLowdbWorkbookRepository } from "./lowdb/workbook-repository";
import { createLowdbQuestionRepository } from "./lowdb/question-repository";
import { createFirestoreWorkbookRepository } from "./firestore/workbook-repository";
import { createFirestoreQuestionRepository } from "./firestore/question-repository";

export type { WorkbookRepository } from "./workbook-repository";
export type { QuestionRepository, ListQuestionsOptions } from "./question-repository";

let cachedWorkbookRepo: WorkbookRepository | null = null;
let cachedQuestionRepo: QuestionRepository | null = null;

function getDataDir(): string {
  const path = process.env.LOWDB_PATH ?? "./data";
  return path;
}

export function getWorkbookRepository(): WorkbookRepository {
  if (cachedWorkbookRepo) return cachedWorkbookRepo;
  const source = process.env.DATA_SOURCE ?? "lowdb";
  if (source === "firestore") {
    const { getFirestore } = require("firebase-admin/firestore");
    cachedWorkbookRepo = createFirestoreWorkbookRepository(getFirestore);
  } else {
    cachedWorkbookRepo = createLowdbWorkbookRepository(getDataDir());
  }
  return cachedWorkbookRepo;
}

export function getQuestionRepository(): QuestionRepository {
  if (cachedQuestionRepo) return cachedQuestionRepo;
  const source = process.env.DATA_SOURCE ?? "lowdb";
  if (source === "firestore") {
    const { getFirestore } = require("firebase-admin/firestore");
    cachedQuestionRepo = createFirestoreQuestionRepository(getFirestore);
  } else {
    cachedQuestionRepo = createLowdbQuestionRepository(getDataDir());
  }
  return cachedQuestionRepo;
}

export function clearRepositoryCache(): void {
  cachedWorkbookRepo = null;
  cachedQuestionRepo = null;
}
