/**
 * TC-005: DraftService / DraftRepository — 下書きの取得・保存（1 問題 1 件上書き）
 */
import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import { createLowdbDraftRepository } from "@/core/repositories/lowdb/draft-repository";

const testDataDir = path.join(__dirname, "fixtures", "draft-data");

describe("DraftRepository (TC-005)", () => {
  beforeEach(async () => {
    await fs.mkdir(testDataDir, { recursive: true });
    try {
      await fs.unlink(path.join(testDataDir, "drafts.json"));
    } catch {
      /* ignore */
    }
  });

  it("get returns null when no draft exists", async () => {
    const repo = createLowdbDraftRepository(testDataDir);
    const d = await repo.get("wb1", "q1", "client1");
    expect(d).toBeNull();
  });

  it("save then get returns the draft (1 problem 1 document)", async () => {
    const repo = createLowdbDraftRepository(testDataDir);
    const draft = {
      id: "draft-wb1-q1-client1",
      workbookId: "wb1",
      questionId: "q1",
      clientId: "client1",
      userAnswer: { cells: [{ id: "c1", content: "x = 1" }] },
      updatedAt: new Date().toISOString(),
    };
    await repo.save(draft);
    const got = await repo.get("wb1", "q1", "client1");
    expect(got).not.toBeNull();
    expect(got!.userAnswer).toEqual(draft.userAnswer);
  });

  it("save overwrites existing draft for same workbook/question/client", async () => {
    const repo = createLowdbDraftRepository(testDataDir);
    await repo.save({
      id: "draft-wb1-q1-client1",
      workbookId: "wb1",
      questionId: "q1",
      clientId: "client1",
      userAnswer: { cells: [{ id: "c1", content: "old" }] },
      updatedAt: new Date().toISOString(),
    });
    await repo.save({
      id: "draft-wb1-q1-client1",
      workbookId: "wb1",
      questionId: "q1",
      clientId: "client1",
      userAnswer: { cells: [{ id: "c1", content: "new" }] },
      updatedAt: new Date().toISOString(),
    });
    const got = await repo.get("wb1", "q1", "client1");
    expect(got!.userAnswer).toEqual({ cells: [{ id: "c1", content: "new" }] });
  });
});
