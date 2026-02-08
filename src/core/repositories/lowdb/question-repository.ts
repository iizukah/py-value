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
        let filtered = list.filter(
          (q: Question) => q.workbookId === options.workbookId && q.status === "published"
        );
        if (options.tags && options.tags.length > 0) {
          filtered = filtered.filter((q: Question) =>
            (q.tags ?? []).some((t: string) => options.tags!.includes(t))
          );
        }
        const sortOpt = options.sort ?? "order";
        if (sortOpt === "order") {
          filtered.sort((a: Question, b: Question) => (a.order ?? 0) - (b.order ?? 0));
        } else if (sortOpt === "difficulty") {
          const orderMap: Record<string, number> = { 初級: 1, 中級: 2, 上級: 3 };
          filtered.sort(
            (a: Question, b: Question) =>
              (orderMap[a.difficulty ?? ""] ?? 0) - (orderMap[b.difficulty ?? ""] ?? 0)
          );
        } else if (sortOpt === "title") {
          filtered.sort((a: Question, b: Question) =>
            (a.title ?? "").localeCompare(b.title ?? "")
          );
        } else if (sortOpt === "favorites") {
          filtered.sort(
            (a: Question, b: Question) =>
              (b.favoriteCount ?? 0) - (a.favoriteCount ?? 0)
          );
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

    async listAllByWorkbookId(workbookId: string): Promise<Question[]> {
      const filePath = path.join(dataDir, "questions.json");
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(raw);
        const list: Question[] = Array.isArray(data) ? data : data.questions ?? [];
        return list
          .filter((q: Question) => q.workbookId === workbookId)
          .sort((a: Question, b: Question) => (a.order ?? 0) - (b.order ?? 0));
      } catch {
        return [];
      }
    },

    async create(question: Question): Promise<Question> {
      const filePath = path.join(dataDir, "questions.json");
      let list: Question[] = [];
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(raw);
        list = Array.isArray(data) ? data : data.questions ?? [];
      } catch {
        /* empty */
      }
      const withWorkbook = { ...question, workbookId: question.workbookId ?? "" };
      list.push(withWorkbook);
      await fs.writeFile(filePath, JSON.stringify(list, null, 2), "utf-8");
      return withWorkbook;
    },

    async update(
      workbookId: string,
      questionId: string,
      data: Partial<Question>
    ): Promise<Question | null> {
      const filePath = path.join(dataDir, "questions.json");
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const dataParsed = JSON.parse(raw);
        const list: Question[] = Array.isArray(dataParsed) ? dataParsed : dataParsed.questions ?? [];
        const idx = list.findIndex(
          (q: Question) => q.workbookId === workbookId && q.id === questionId
        );
        if (idx < 0) return null;
        list[idx] = { ...list[idx], ...data };
        await fs.writeFile(filePath, JSON.stringify(list, null, 2), "utf-8");
        return list[idx];
      } catch {
        return null;
      }
    },

    async delete(workbookId: string, questionId: string): Promise<boolean> {
      const filePath = path.join(dataDir, "questions.json");
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const dataParsed = JSON.parse(raw);
        const list: Question[] = Array.isArray(dataParsed) ? dataParsed : dataParsed.questions ?? [];
        const next = list.filter(
          (q: Question) => !(q.workbookId === workbookId && q.id === questionId)
        );
        if (next.length === list.length) return false;
        await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf-8");
        return true;
      } catch {
        return false;
      }
    },
  };
}
