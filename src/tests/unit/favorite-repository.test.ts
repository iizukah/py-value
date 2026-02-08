/**
 * TC-007: FavoriteService / FavoriteRepository — 追加 count+1、解除 count-1、0 で削除、clientId で一覧
 */
import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import { createLowdbFavoriteRepository } from "@/core/repositories/lowdb/favorite-repository";

const testDataDir = path.join(__dirname, "fixtures", "favorite-data");

describe("FavoriteRepository (TC-007)", () => {
  beforeEach(async () => {
    await fs.mkdir(testDataDir, { recursive: true });
    try {
      await fs.unlink(path.join(testDataDir, "favorites.json"));
    } catch {
      /* ignore */
    }
  });

  it("add creates new Favorite with count=1", async () => {
    const repo = createLowdbFavoriteRepository(testDataDir);
    const f = await repo.add("wb1", "q1", "client1");
    expect(f.count).toBe(1);
    expect(f.workbookId).toBe("wb1");
    expect(f.questionId).toBe("q1");
    expect(f.clientId).toBe("client1");
  });

  it("add again on same key increments count", async () => {
    const repo = createLowdbFavoriteRepository(testDataDir);
    await repo.add("wb1", "q1", "client1");
    const f2 = await repo.add("wb1", "q1", "client1");
    expect(f2.count).toBe(2);
  });

  it("remove decrements count and returns updated Favorite", async () => {
    const repo = createLowdbFavoriteRepository(testDataDir);
    await repo.add("wb1", "q1", "client1");
    await repo.add("wb1", "q1", "client1");
    const after = await repo.remove("wb1", "q1", "client1");
    expect(after!.count).toBe(1);
  });

  it("remove when count becomes 0 deletes document and returns null", async () => {
    const repo = createLowdbFavoriteRepository(testDataDir);
    await repo.add("wb1", "q1", "client1");
    const after = await repo.remove("wb1", "q1", "client1");
    expect(after).toBeNull();
    const got = await repo.get("wb1", "q1", "client1");
    expect(got).toBeNull();
  });

  it("listByWorkbookAndClient returns only that client's favorites", async () => {
    const repo = createLowdbFavoriteRepository(testDataDir);
    await repo.add("wb1", "q1", "client1");
    await repo.add("wb1", "q2", "client1");
    await repo.add("wb1", "q1", "client2");
    const list = await repo.listByWorkbookAndClient("wb1", "client1");
    expect(list.length).toBe(2);
    expect(list.map((f) => f.questionId).sort()).toEqual(["q1", "q2"]);
  });

  it("countByQuestion returns sum of count for that question", async () => {
    const repo = createLowdbFavoriteRepository(testDataDir);
    await repo.add("wb1", "q1", "client1");
    await repo.add("wb1", "q1", "client1");
    await repo.add("wb1", "q1", "client2");
    const n = await repo.countByQuestion("wb1", "q1");
    expect(n).toBe(3);
  });
});
