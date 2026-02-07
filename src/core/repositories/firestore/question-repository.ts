/**
 * Firestore 用 QuestionRepository 実装（INFRA-01 §5, DATA-01 §3.3 フラット）
 */

import type { Firestore } from "firebase-admin/firestore";
import type { QuestionRepository, ListQuestionsOptions } from "../question-repository";
import type { Question } from "@/lib/types";

export function createFirestoreQuestionRepository(
  getFirestore: () => Firestore
): QuestionRepository {
  return {
    async listByWorkbookId(options: ListQuestionsOptions): Promise<Question[]> {
      const db = getFirestore();
      const q = db
        .collection("questions")
        .where("workbookId", "==", options.workbookId)
        .where("status", "==", "published");
      const snap = await q.get();
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Question));
      if (options.sort === "order" || !options.sort) {
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
      return list;
    },

    async getById(workbookId: string, questionId: string): Promise<Question | null> {
      const db = getFirestore();
      const doc = await db.collection("questions").doc(questionId).get();
      if (!doc.exists) return null;
      const data = doc.data()!;
      if (data.workbookId !== workbookId) return null;
      return { id: doc.id, ...data } as Question;
    },
  };
}
