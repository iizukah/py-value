/**
 * Firestore 用 HistoryRepository 実装（API-005/006, DATA-01 §3.5）
 * コレクション: histories。save で id をドキュメント ID として使用。
 */

import type { HistoryRepository } from "../history-repository";
import type { History } from "@/lib/types";
import { getFirestoreSafe } from "@/core/firebase-admin";

export function createFirestoreHistoryRepository(): HistoryRepository {
  return {
    async save(history: History): Promise<void> {
      const db = getFirestoreSafe();
      const ref = db.collection("histories").doc(history.id);
      await ref.set(history);
    },

    async listByWorkbookAndClient(workbookId: string, clientId: string): Promise<History[]> {
      const db = getFirestoreSafe();
      const snap = await db
        .collection("histories")
        .where("workbookId", "==", workbookId)
        .where("clientId", "==", clientId)
        .orderBy("createdAt", "desc")
        .get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as History));
    },

    async getById(workbookId: string, historyId: string, clientId: string): Promise<History | null> {
      const db = getFirestoreSafe();
      const doc = await db.collection("histories").doc(historyId).get();
      if (!doc.exists) return null;
      const data = doc.data() as History;
      if (data.workbookId !== workbookId || data.clientId !== clientId) return null;
      return { id: doc.id, ...data };
    },

    async enforceLimit(workbookId: string, clientId: string, limit: number): Promise<void> {
      const db = getFirestoreSafe();
      const snap = await db
        .collection("histories")
        .where("workbookId", "==", workbookId)
        .where("clientId", "==", clientId)
        .orderBy("createdAt", "desc")
        .get();
      if (snap.docs.length <= limit) return;
      const toRemove = snap.docs.slice(limit);
      const batch = db.batch();
      for (const d of toRemove) {
        batch.delete(d.ref);
      }
      await batch.commit();
    },
  };
}
