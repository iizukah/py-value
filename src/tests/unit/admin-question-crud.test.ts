/**
 * TC-011: 問題 CRUD（管理）— 作成・取得・更新・削除・status 切り替え
 */
import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import { createLowdbQuestionRepository } from "@/core/repositories/lowdb/question-repository";
import type { Question } from "@/lib/types";

const testDataDir = path.join(__dirname, "fixtures", "admin-crud-data");

describe("QuestionRepository admin CRUD (TC-011)", () => {
  beforeEach(async () => {
    await fs.mkdir(testDataDir, { recursive: true });
    await fs.writeFile(
      path.join(testDataDir, "questions.json"),
      JSON.stringify([]),
      "utf-8"
    );
  });

  it("create then getById returns the question", async () => {
    const repo = createLowdbQuestionRepository(testDataDir);
    const q: Question = {
      id: "q1",
      workbookId: "wb1",
      title: "Q1",
      type: "python-analysis",
      status: "draft",
    };
    const created = await repo.create(q);
    expect(created.id).toBe("q1");
    const got = await repo.getById("wb1", "q1");
    expect(got?.title).toBe("Q1");
    expect(got?.status).toBe("draft");
  });

  it("update changes status", async () => {
    const repo = createLowdbQuestionRepository(testDataDir);
    await repo.create({
      id: "q1",
      workbookId: "wb1",
      title: "Q1",
      type: "python-analysis",
      status: "draft",
    });
    const updated = await repo.update("wb1", "q1", { status: "published" });
    expect(updated?.status).toBe("published");
    const got = await repo.getById("wb1", "q1");
    expect(got?.status).toBe("published");
  });

  it("delete removes the question", async () => {
    const repo = createLowdbQuestionRepository(testDataDir);
    await repo.create({
      id: "q1",
      workbookId: "wb1",
      title: "Q1",
      type: "python-analysis",
      status: "published",
    });
    const ok = await repo.delete("wb1", "q1");
    expect(ok).toBe(true);
    expect(await repo.getById("wb1", "q1")).toBeNull();
  });

  it("listAllByWorkbookId includes draft", async () => {
    const repo = createLowdbQuestionRepository(testDataDir);
    await repo.create({
      id: "q1",
      workbookId: "wb1",
      title: "Q1",
      type: "python-analysis",
      status: "draft",
    });
    const list = await repo.listAllByWorkbookId("wb1");
    expect(list.length).toBe(1);
    expect(list[0].status).toBe("draft");
  });
});
