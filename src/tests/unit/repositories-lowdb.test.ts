/**
 * TC-005, TC-009: Lowdb WorkbookRepository / QuestionRepository
 */
import { describe, it, expect } from "vitest";
import path from "path";
import { createLowdbWorkbookRepository } from "@/core/repositories/lowdb/workbook-repository";
import { createLowdbQuestionRepository } from "@/core/repositories/lowdb/question-repository";

describe("Lowdb WorkbookRepository", () => {
  it("returns empty array when file does not exist", async () => {
    const repo = createLowdbWorkbookRepository(path.join(__dirname, "nonexistent-dir"));
    const list = await repo.list();
    expect(list).toEqual([]);
  });

  it("getById returns null when list is empty", async () => {
    const repo = createLowdbWorkbookRepository(path.join(__dirname, "nonexistent-dir"));
    const w = await repo.getById("any");
    expect(w).toBeNull();
  });
});

describe("Lowdb QuestionRepository", () => {
  const noDataDir = path.join(__dirname, "nonexistent-dir");
  const fixtureDir = path.join(__dirname, "fixtures");

  it("returns empty array when file does not exist", async () => {
    const repo = createLowdbQuestionRepository(noDataDir);
    const list = await repo.listByWorkbookId({ workbookId: "wb1" });
    expect(list).toEqual([]);
  });

  it("getById returns null when file does not exist", async () => {
    const repo = createLowdbQuestionRepository(noDataDir);
    const q = await repo.getById("wb1", "q1");
    expect(q).toBeNull();
  });

  /** TC-003: 一覧・ソート・tags が正しく適用される */
  describe("TC-003 sort and tags", () => {
    it("sort=order returns by order field", async () => {
      const repo = createLowdbQuestionRepository(fixtureDir);
      const list = await repo.listByWorkbookId({ workbookId: "wb1", sort: "order" });
      expect(list.map((q) => q.id)).toEqual(["q2", "q1", "q3"]);
    });

    it("sort=title returns alphabetically by title", async () => {
      const repo = createLowdbQuestionRepository(fixtureDir);
      const list = await repo.listByWorkbookId({ workbookId: "wb1", sort: "title" });
      expect(list.map((q) => q.title)).toEqual(["Alpha", "Beta", "Gamma"]);
    });

    it("sort=difficulty returns by 初級<中級<上級", async () => {
      const repo = createLowdbQuestionRepository(fixtureDir);
      const list = await repo.listByWorkbookId({ workbookId: "wb1", sort: "difficulty" });
      expect(list.map((q) => q.difficulty)).toEqual(["初級", "中級", "上級"]);
    });

    it("sort=favorites returns by favoriteCount descending", async () => {
      const repo = createLowdbQuestionRepository(fixtureDir);
      const list = await repo.listByWorkbookId({ workbookId: "wb1", sort: "favorites" });
      expect(list.map((q) => q.favoriteCount)).toEqual([20, 10, 5]);
    });

    it("tags filter returns only questions with at least one matching tag", async () => {
      const repo = createLowdbQuestionRepository(fixtureDir);
      const list = await repo.listByWorkbookId({ workbookId: "wb1", tags: ["統計"] });
      expect(list.map((q) => q.id).sort()).toEqual(["q1", "q2"]);
    });

    it("tags 回帰 returns only q3", async () => {
      const repo = createLowdbQuestionRepository(fixtureDir);
      const list = await repo.listByWorkbookId({ workbookId: "wb1", tags: ["回帰"] });
      expect(list.map((q) => q.id)).toEqual(["q3"]);
    });
  });

  /** TC-004: 0 件時は空配列 */
  it("returns empty array for workbook with no published questions (TC-004)", async () => {
    const repo = createLowdbQuestionRepository(fixtureDir);
    const list = await repo.listByWorkbookId({ workbookId: "other-wb" });
    expect(list).toEqual([]);
  });
});
