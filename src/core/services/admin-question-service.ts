/**
 * 管理用問題サービス（TC-011, TC-012, TC-013）
 * 問題 CRUD、インポート（1 件でもバリエラーなら全体拒否）、エクスポート。
 */

import { getQuestionRepository } from "@/core/repositories";
import type { Question } from "@/lib/types";

export async function listAllQuestions(workbookId: string): Promise<Question[]> {
  const repo = getQuestionRepository();
  return repo.listAllByWorkbookId(workbookId);
}

export async function createQuestion(question: Question): Promise<Question> {
  const repo = getQuestionRepository();
  return repo.create(question);
}

export async function getQuestionAdmin(
  workbookId: string,
  questionId: string
): Promise<Question | null> {
  const repo = getQuestionRepository();
  return repo.getById(workbookId, questionId);
}

export async function updateQuestion(
  workbookId: string,
  questionId: string,
  data: Partial<Question>
): Promise<Question | null> {
  const repo = getQuestionRepository();
  return repo.update(workbookId, questionId, data);
}

export async function deleteQuestion(
  workbookId: string,
  questionId: string
): Promise<boolean> {
  const repo = getQuestionRepository();
  return repo.delete(workbookId, questionId);
}

/** TC-012: 1 件でもバリデーションエラーがあれば全体拒否 */
export interface ImportResult {
  ok: boolean;
  errors?: string[];
}

function validateQuestion(q: unknown, index: number): string | null {
  if (q == null || typeof q !== "object") return `[${index}] オブジェクトではありません`;
  const o = q as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id.trim()) return `[${index}] id が無効です`;
  if (typeof o.title !== "string" || !o.title.trim()) return `[${index}] title が無効です`;
  if (typeof o.type !== "string" || !o.type.trim()) return `[${index}] type が無効です`;
  if (o.status !== "draft" && o.status !== "published") return `[${index}] status は draft または published です`;
  return null;
}

export async function importQuestions(
  workbookId: string,
  questions: unknown[]
): Promise<ImportResult> {
  const errors: string[] = [];
  for (let i = 0; i < questions.length; i++) {
    const err = validateQuestion(questions[i], i);
    if (err) errors.push(err);
  }
  if (errors.length > 0) return { ok: false, errors };

  const repo = getQuestionRepository();
  for (const q of questions as Question[]) {
    const withWb = { ...q, workbookId };
    const existing = await repo.getById(workbookId, withWb.id);
    if (existing) await repo.update(workbookId, withWb.id, withWb);
    else await repo.create(withWb);
  }
  return { ok: true };
}

/** TC-013: 全問題を 1 配列で返す。データセットは参照のみ。 */
export async function exportQuestions(workbookId: string): Promise<Question[]> {
  const repo = getQuestionRepository();
  return repo.listAllByWorkbookId(workbookId);
}
