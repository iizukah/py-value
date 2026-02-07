/**
 * Lowdb 用 WorkbookRepository 実装（INFRA-01 §4.1）
 */

import path from "path";
import fs from "fs/promises";
import type { WorkbookRepository } from "../workbook-repository";
import type { Workbook } from "@/lib/types";

export function createLowdbWorkbookRepository(dataDir: string): WorkbookRepository {

  return {
    async list(): Promise<Workbook[]> {
      const filePath = path.join(dataDir, "workbooks.json");
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : data.workbooks ?? [];
      } catch {
        return [];
      }
    },

    async getById(id: string): Promise<Workbook | null> {
      const list = await this.list();
      return list.find((w) => w.id === id) ?? null;
    },
  };
}
