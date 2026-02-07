/**
 * TC-INT-10: API-001 GET workbooks が Lowdb から正しく返る（TEST-01 §4.2）
 */
import { describe, it, expect, beforeAll } from "vitest";
import path from "path";
import { clearRepositoryCache } from "@/core/repositories";

describe("GET /api/workbooks", () => {
  beforeAll(() => {
    process.env.DATA_SOURCE = "lowdb";
    process.env.LOWDB_PATH = path.join(process.cwd(), "data");
    clearRepositoryCache();
  });

  it("returns 200 and array of workbooks", async () => {
    const { GET } = await import("@/app/api/workbooks/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });

  it("returns workbook with id py-value when data exists", async () => {
    const { GET } = await import("@/app/api/workbooks/route");
    const res = await GET();
    const json = await res.json();
    const wb = json.find((w: { id: string }) => w.id === "py-value");
    if (json.length > 0) {
      expect(wb).toBeDefined();
      expect(wb.title).toBe("Pythonデータ分析");
    }
  });
});
