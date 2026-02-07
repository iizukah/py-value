/**
 * Firestore 用 WorkbookRepository 実装（INFRA-01 §5, DATA-01 §3.2）
 */

import type { Firestore } from "firebase-admin/firestore";
import type { WorkbookRepository } from "../workbook-repository";
import type { Workbook } from "@/lib/types";

export function createFirestoreWorkbookRepository(getFirestore: () => Firestore): WorkbookRepository {
  return {
    async list(): Promise<Workbook[]> {
      const db = getFirestore();
      const snap = await db.collection("workbooks").get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Workbook));
    },

    async getById(id: string): Promise<Workbook | null> {
      const db = getFirestore();
      const doc = await db.collection("workbooks").doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as Workbook;
    },
  };
}
