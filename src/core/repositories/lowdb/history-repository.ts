/**
 * Lowdb 用 HistoryRepository 実装（TC-006）
 * histories.json を読み書き。ワークブック単位の件数上限を enforceLimit で適用。
 */

import path from "path";
import fs from "fs/promises";
import type { HistoryRepository } from "../history-repository";
import type { History } from "@/lib/types";

export function createLowdbHistoryRepository(dataDir: string): HistoryRepository {
  const filePath = path.join(dataDir, "histories.json");

  async function readAll(): Promise<History[]> {
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : data.histories ?? [];
    } catch {
      return [];
    }
  }

  async function writeAll(list: History[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(list, null, 2), "utf-8");
  }

  return {
    async save(history: History): Promise<void> {
      const list = await readAll();
      const idx = list.findIndex((h) => h.id === history.id);
      if (idx >= 0) list[idx] = history;
      else list.push(history);
      await writeAll(list);
    },

    async listByWorkbookAndClient(workbookId: string, clientId: string): Promise<History[]> {
      const list = await readAll();
      return list
        .filter((h) => h.workbookId === workbookId && h.clientId === clientId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async getById(workbookId: string, historyId: string, clientId: string): Promise<History | null> {
      const list = await readAll();
      return list.find(
        (h) => h.id === historyId && h.workbookId === workbookId && h.clientId === clientId
      ) ?? null;
    },

    async enforceLimit(workbookId: string, clientId: string, limit: number): Promise<void> {
      const list = await readAll();
      const subset = list.filter((h) => h.workbookId === workbookId && h.clientId === clientId);
      if (subset.length <= limit) return;
      subset.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const toRemove = subset.slice(limit).map((h) => h.id);
      const next = list.filter((h) => !toRemove.includes(h.id));
      await writeAll(next);
    },
  };
}
