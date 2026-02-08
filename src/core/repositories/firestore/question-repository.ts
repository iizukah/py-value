/**
 * Firestore 用 QuestionRepository 実装（INFRA-01 §5, DATA-01 §3.3 フラット）
 * getFirestoreSafe を直接参照し、ビルド後の require 不整合を避ける。
 */

import type { QuestionRepository, ListQuestionsOptions } from "../question-repository";
import type { Question } from "@/lib/types";
import { getFirestoreSafe } from "@/core/firebase-admin";

export function createFirestoreQuestionRepository(): QuestionRepository {
  return {
    async listByWorkbookId(options: ListQuestionsOptions): Promise<Question[]> {
      const db = getFirestoreSafe();
      const q = db
        .collection("questions")
        .where("workbookId", "==", options.workbookId)
        .where("status", "==", "published");
      const snap = await q.get();
      let list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Question));
      if (options.tags && options.tags.length > 0) {
        list = list.filter((q) =>
          (q.tags ?? []).some((t) => options.tags!.includes(t))
        );
      }
      const sortOpt = options.sort ?? "order";
      if (sortOpt === "order" || !sortOpt) {
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      } else if (sortOpt === "difficulty") {
        const orderMap: Record<string, number> = { 初級: 1, 中級: 2, 上級: 3 };
        list.sort(
          (a, b) =>
            (orderMap[a.difficulty ?? ""] ?? 0) - (orderMap[b.difficulty ?? ""] ?? 0)
        );
      } else if (sortOpt === "title") {
        list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
      }
      return list;
    },

    async getById(workbookId: string, questionId: string): Promise<Question | null> {
      const db = getFirestoreSafe();
      const doc = await db.collection("questions").doc(questionId).get();
      if (!doc.exists) return null;
      const data = doc.data()!;
      if (data.workbookId !== workbookId) return null;
      return { id: doc.id, ...data } as Question;
    },

    async listAllByWorkbookId(workbookId: string): Promise<Question[]> {
      const db = getFirestoreSafe();
      const snap = await db
        .collection("questions")
        .where("workbookId", "==", workbookId)
        .get();
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question));
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return list;
    },

    async create(question: Question): Promise<Question> {
      const db = getFirestoreSafe();
      const ref = db.collection("questions").doc(question.id);
      const data = { ...question, workbookId: question.workbookId ?? "" };
      await ref.set(data);
      return { ...data, id: ref.id };
    },

    async update(
      workbookId: string,
      questionId: string,
      data: Partial<Question>
    ): Promise<Question | null> {
      const db = getFirestoreSafe();
      const ref = db.collection("questions").doc(questionId);
      const doc = await ref.get();
      if (!doc.exists || (doc.data() as Question).workbookId !== workbookId) return null;
      await ref.update(data);
      const updated = await ref.get();
      return { id: updated.id, ...updated.data() } as Question;
    },

    async delete(workbookId: string, questionId: string): Promise<boolean> {
      const db = getFirestoreSafe();
      const ref = db.collection("questions").doc(questionId);
      const doc = await ref.get();
      if (!doc.exists || (doc.data() as Question).workbookId !== workbookId) return false;
      await ref.delete();
      return true;
    },
  };
}
