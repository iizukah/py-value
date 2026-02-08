/**
 * Firestore 用 FavoriteRepository 実装（API-019/020, DATA-01 §3.4）
 * コレクション: favorites。workbookId + questionId + clientId で一意。
 */

import type { FavoriteRepository } from "../favorite-repository";
import type { Favorite } from "@/lib/types";
import { getFirestoreSafe } from "@/core/firebase-admin";

function docId(workbookId: string, questionId: string, clientId: string): string {
  return `${workbookId}_${questionId}_${clientId}`;
}

export function createFirestoreFavoriteRepository(): FavoriteRepository {
  return {
    async get(workbookId: string, questionId: string, clientId: string): Promise<Favorite | null> {
      const db = getFirestoreSafe();
      const doc = await db.collection("favorites").doc(docId(workbookId, questionId, clientId)).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as Favorite;
    },

    async add(workbookId: string, questionId: string, clientId: string): Promise<Favorite> {
      const db = getFirestoreSafe();
      const id = docId(workbookId, questionId, clientId);
      const ref = db.collection("favorites").doc(id);
      const docSnap = await ref.get();
      const now = new Date().toISOString();
      if (docSnap.exists) {
        const data = docSnap.data() as Favorite;
        const newCount = (data.count ?? 0) + 1;
        await ref.update({ count: newCount, updatedAt: now });
        return { ...data, count: newCount, updatedAt: now };
      }
      const newFav: Favorite = {
        id,
        workbookId,
        questionId,
        clientId,
        count: 1,
        updatedAt: now,
      };
      await ref.set(newFav);
      return newFav;
    },

    async remove(workbookId: string, questionId: string, clientId: string): Promise<Favorite | null> {
      const db = getFirestoreSafe();
      const id = docId(workbookId, questionId, clientId);
      const ref = db.collection("favorites").doc(id);
      const docSnap = await ref.get();
      if (!docSnap.exists) return null;
      const data = docSnap.data() as Favorite;
      const newCount = (data.count ?? 1) - 1;
      const now = new Date().toISOString();
      if (newCount <= 0) {
        await ref.delete();
        return null;
      }
      await ref.update({ count: newCount, updatedAt: now });
      return { ...data, count: newCount, updatedAt: now };
    },

    async listByWorkbookAndClient(workbookId: string, clientId: string): Promise<Favorite[]> {
      const db = getFirestoreSafe();
      const snap = await db
        .collection("favorites")
        .where("workbookId", "==", workbookId)
        .where("clientId", "==", clientId)
        .get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Favorite));
    },

    async countByQuestion(workbookId: string, questionId: string): Promise<number> {
      const db = getFirestoreSafe();
      const snap = await db
        .collection("favorites")
        .where("workbookId", "==", workbookId)
        .where("questionId", "==", questionId)
        .get();
      return snap.docs.reduce((sum, d) => sum + ((d.data() as Favorite).count ?? 0), 0);
    },
  };
}
