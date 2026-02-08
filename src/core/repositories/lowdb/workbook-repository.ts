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

    async update(id: string, data: Partial<Pick<Workbook, "title" | "description" | "historyLimit">>): Promise<void> {
      const filePath = path.join(dataDir, "workbooks.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      const list: Workbook[] = Array.isArray(parsed) ? parsed : parsed.workbooks ?? [];
      const idx = list.findIndex((w) => w.id === id);
      if (idx < 0) return;
      list[idx] = { ...list[idx], ...data };
      const out = Array.isArray(parsed) ? list : { ...parsed, workbooks: list };
      await fs.writeFile(filePath, JSON.stringify(out, null, 2), "utf-8");
    },
  };
}
