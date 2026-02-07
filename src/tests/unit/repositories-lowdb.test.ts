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
  it("returns empty array when file does not exist", async () => {
    const repo = createLowdbQuestionRepository(path.join(__dirname, "nonexistent-dir"));
    const list = await repo.listByWorkbookId({ workbookId: "wb1" });
    expect(list).toEqual([]);
  });

  it("getById returns null when file does not exist", async () => {
    const repo = createLowdbQuestionRepository(path.join(__dirname, "nonexistent-dir"));
    const q = await repo.getById("wb1", "q1");
    expect(q).toBeNull();
  });
});
