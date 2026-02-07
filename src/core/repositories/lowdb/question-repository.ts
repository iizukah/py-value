/**
 * Lowdb 用 QuestionRepository 実装（INFRA-01 §4.1）
 * 公開済みのみ返す。初回は sort=order のみ対応。
 */

import path from "path";
import fs from "fs/promises";
import type { QuestionRepository } from "../question-repository";
import type { Question } from "@/lib/types";

export function createLowdbQuestionRepository(dataDir: string): QuestionRepository {

  return {
    async listByWorkbookId(options): Promise<Question[]> {
      const filePath = path.join(dataDir, "questions.json");
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(raw);
        const list: Question[] = Array.isArray(data) ? data : data.questions ?? [];
        const filtered = list.filter(
          (q: Question) => q.workbookId === options.workbookId && q.status === "published"
        );
        const order = options.sort === "order" || !options.sort;
        if (order) {
          filtered.sort((a: Question, b: Question) => (a.order ?? 0) - (b.order ?? 0));
        }
        return filtered;
      } catch {
        return [];
      }
    },

    async getById(workbookId: string, questionId: string): Promise<Question | null> {
      const filePath = path.join(dataDir, "questions.json");
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(raw);
        const list: Question[] = Array.isArray(data) ? data : data.questions ?? [];
        return list.find((q: Question) => q.workbookId === workbookId && q.id === questionId) ?? null;
      } catch {
        return null;
      }
    },
  };
}
