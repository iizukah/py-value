/**
 * Firestore 用 WorkbookRepository 実装（INFRA-01 §5, DATA-01 §3.2）
 * getFirestoreSafe を直接参照し、ビルド後の require 不整合を避ける。
 */

import type { WorkbookRepository } from "../workbook-repository";
import type { Workbook } from "@/lib/types";
import { getFirestoreSafe } from "@/core/firebase-admin";

export function createFirestoreWorkbookRepository(): WorkbookRepository {
  return {
    async list(): Promise<Workbook[]> {
      const db = getFirestoreSafe();
      const snap = await db.collection("workbooks").get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Workbook));
    },

    async getById(id: string): Promise<Workbook | null> {
      const db = getFirestoreSafe();
      const doc = await db.collection("workbooks").doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as Workbook;
    },
  };
}
