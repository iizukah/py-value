/**
 * TC-006: HistoryService / HistoryRepository — 履歴の保存・一覧・詳細・件数上限
 */
import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import { createLowdbHistoryRepository } from "@/core/repositories/lowdb/history-repository";

const testDataDir = path.join(__dirname, "fixtures", "history-data");

describe("HistoryRepository (TC-006)", () => {
  beforeEach(async () => {
    await fs.mkdir(testDataDir, { recursive: true });
    try {
      await fs.unlink(path.join(testDataDir, "histories.json"));
    } catch {
      /* ignore */
    }
  });

  it("listByWorkbookAndClient returns empty when none", async () => {
    const repo = createLowdbHistoryRepository(testDataDir);
    const list = await repo.listByWorkbookAndClient("wb1", "client1");
    expect(list).toEqual([]);
  });

  it("save then list returns histories for that workbook and client", async () => {
    const repo = createLowdbHistoryRepository(testDataDir);
    const h1: import("@/lib/types").History = {
      id: "h1",
      workbookId: "wb1",
      questionId: "q1",
      clientId: "client1",
      status: "submitted",
      userAnswer: {},
      isCorrect: true,
      createdAt: "2025-01-01T00:00:00Z",
      judgedAt: "2025-01-01T00:00:01Z",
    };
    await repo.save(h1);
    const list = await repo.listByWorkbookAndClient("wb1", "client1");
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("h1");
  });

  it("getById returns null when not found or wrong client", async () => {
    const repo = createLowdbHistoryRepository(testDataDir);
    const got = await repo.getById("wb1", "h1", "other-client");
    expect(got).toBeNull();
  });

  it("enforceLimit keeps only latest limit items per workbook+client", async () => {
    const repo = createLowdbHistoryRepository(testDataDir);
    for (let i = 0; i < 5; i++) {
      await repo.save({
        id: `h-${i}`,
        workbookId: "wb1",
        questionId: "q1",
        clientId: "client1",
        status: "submitted",
        userAnswer: {},
        createdAt: new Date(2025, 0, 1 + i).toISOString(),
      });
    }
    await repo.enforceLimit("wb1", "client1", 2);
    const list = await repo.listByWorkbookAndClient("wb1", "client1");
    expect(list.length).toBe(2);
    expect(list.map((h) => h.id).sort()).toEqual(["h-4", "h-3"].sort());
  });
});
