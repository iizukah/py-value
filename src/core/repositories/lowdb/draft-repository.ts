/**
 * Lowdb 用 DraftRepository 実装（TC-005）
 * drafts.json を読み書き。1 問題 1 件で上書き（同一 key なら置換）。
 */

import path from "path";
import fs from "fs/promises";
import type { DraftRepository } from "../draft-repository";
import type { Draft } from "@/lib/types";

function draftKey(d: { workbookId: string; questionId: string; clientId: string }): string {
  return `${d.workbookId}:${d.questionId}:${d.clientId}`;
}

export function createLowdbDraftRepository(dataDir: string): DraftRepository {
  const filePath = path.join(dataDir, "drafts.json");

  async function readAll(): Promise<Draft[]> {
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : data.drafts ?? [];
    } catch {
      return [];
    }
  }

  async function writeAll(list: Draft[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(list, null, 2), "utf-8");
  }

  return {
    async get(workbookId: string, questionId: string, clientId: string): Promise<Draft | null> {
      const list = await readAll();
      return list.find(
        (d) => d.workbookId === workbookId && d.questionId === questionId && d.clientId === clientId
      ) ?? null;
    },

    async save(draft: Draft): Promise<void> {
      const list = await readAll();
      const key = draftKey(draft);
      const next = list.filter(
        (d) => draftKey(d) !== key
      );
      next.push(draft);
      await writeAll(next);
    },
  };
}
