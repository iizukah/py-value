/**
 * TC-012: インポート・バリデーション — 1 件でもバリエラーがあれば全体拒否
 * TC-013: エクスポート — 全問題を 1 配列で返す
 */
import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import { importQuestions, exportQuestions } from "@/core/services/admin-question-service";

const testDataDir = path.join(__dirname, "fixtures", "admin-import-export-data");

describe("importQuestions (TC-012)", () => {
  beforeEach(async () => {
    await fs.mkdir(testDataDir, { recursive: true });
    await fs.writeFile(
      path.join(testDataDir, "questions.json"),
      JSON.stringify([]),
      "utf-8"
    );
    process.env.LOWDB_PATH = testDataDir;
    const { clearRepositoryCache } = await import("@/core/repositories");
    clearRepositoryCache();
  });

  it("returns errors when one item is invalid (no id)", async () => {
    const result = await importQuestions("wb1", [
      { id: "q1", title: "Q1", type: "python-analysis", status: "published" },
      { title: "No id", type: "python-analysis", status: "draft" },
    ]);
    expect(result.ok).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("returns ok and saves when all valid", async () => {
    const result = await importQuestions("wb1", [
      { id: "q1", title: "Q1", type: "python-analysis", status: "published" },
    ]);
    expect(result.ok).toBe(true);
    const exported = await exportQuestions("wb1");
    expect(exported.length).toBe(1);
    expect(exported[0].title).toBe("Q1");
  });
});

describe("exportQuestions (TC-013)", () => {
  beforeEach(async () => {
    await fs.mkdir(testDataDir, { recursive: true });
    await fs.writeFile(
      path.join(testDataDir, "questions.json"),
      JSON.stringify([
        { id: "q1", workbookId: "wb1", title: "Q1", type: "python-analysis", status: "published" },
      ]),
      "utf-8"
    );
    process.env.LOWDB_PATH = testDataDir;
    const { clearRepositoryCache } = await import("@/core/repositories");
    clearRepositoryCache();
  });

  it("returns all questions for workbook as single array", async () => {
    const list = await exportQuestions("wb1");
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("q1");
  });
});
