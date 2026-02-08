/**
 * Lowdb 用 FavoriteRepository 実装（TC-007）
 * favorites.json。追加で count+1、解除で count-1、0 で削除。
 */

import path from "path";
import fs from "fs/promises";
import type { FavoriteRepository } from "../favorite-repository";
import type { Favorite } from "@/lib/types";

function favKey(w: string, q: string, c: string): string {
  return `${w}:${q}:${c}`;
}

export function createLowdbFavoriteRepository(dataDir: string): FavoriteRepository {
  const filePath = path.join(dataDir, "favorites.json");

  async function readAll(): Promise<Favorite[]> {
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : data.favorites ?? [];
    } catch {
      return [];
    }
  }

  async function writeAll(list: Favorite[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(list, null, 2), "utf-8");
  }

  return {
    async get(workbookId: string, questionId: string, clientId: string): Promise<Favorite | null> {
      const list = await readAll();
      return list.find(
        (f) => f.workbookId === workbookId && f.questionId === questionId && f.clientId === clientId
      ) ?? null;
    },

    async add(workbookId: string, questionId: string, clientId: string): Promise<Favorite> {
      const list = await readAll();
      const now = new Date().toISOString();
      const existing = list.find(
        (f) => f.workbookId === workbookId && f.questionId === questionId && f.clientId === clientId
      );
      if (existing) {
        existing.count += 1;
        existing.updatedAt = now;
        await writeAll(list);
        return existing;
      }
      const newFav: Favorite = {
        id: `fav-${workbookId}-${questionId}-${clientId}`,
        workbookId,
        questionId,
        clientId,
        count: 1,
        updatedAt: now,
      };
      list.push(newFav);
      await writeAll(list);
      return newFav;
    },

    async remove(workbookId: string, questionId: string, clientId: string): Promise<Favorite | null> {
      const list = await readAll();
      const idx = list.findIndex(
        (f) => f.workbookId === workbookId && f.questionId === questionId && f.clientId === clientId
      );
      if (idx < 0) return null;
      const f = list[idx];
      f.count -= 1;
      f.updatedAt = new Date().toISOString();
      if (f.count <= 0) {
        list.splice(idx, 1);
        await writeAll(list);
        return null;
      }
      await writeAll(list);
      return f;
    },

    async listByWorkbookAndClient(workbookId: string, clientId: string): Promise<Favorite[]> {
      const list = await readAll();
      return list.filter((f) => f.workbookId === workbookId && f.clientId === clientId);
    },

    async countByQuestion(workbookId: string, questionId: string): Promise<number> {
      const list = await readAll();
      return list
        .filter((f) => f.workbookId === workbookId && f.questionId === questionId)
        .reduce((sum, f) => sum + f.count, 0);
    },
  };
}
