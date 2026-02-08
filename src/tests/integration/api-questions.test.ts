/**
 * TC-INT-11: API-003 GET questions が sort, tags, favoriteCount を反映する（TEST-01 §4.2）
 */
import { describe, it, expect, beforeAll } from "vitest";
import path from "path";
import { clearRepositoryCache } from "@/core/repositories";

describe("GET /api/workbooks/[workbookId]/questions", () => {
  beforeAll(() => {
    process.env.DATA_SOURCE = "lowdb";
    process.env.LOWDB_PATH = path.join(process.cwd(), "data");
    clearRepositoryCache();
  });

  it("returns 200 and array with sort param", async () => {
    const { GET } = await import("@/app/api/workbooks/[workbookId]/questions/route");
    const res = await GET(
      new Request("http://localhost/api/workbooks/py-value/questions?sort=title"),
      { params: Promise.resolve({ workbookId: "py-value" }) }
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });

  it("returns questions with favoriteCount when available", async () => {
    const { GET } = await import("@/app/api/workbooks/[workbookId]/questions/route");
    const res = await GET(
      new Request("http://localhost/api/workbooks/py-value/questions"),
      { params: Promise.resolve({ workbookId: "py-value" }) }
    );
    const json = await res.json();
    if (json.length > 0) {
      expect(json[0]).toHaveProperty("favoriteCount");
    }
  });

  it("accepts tags param", async () => {
    const { GET } = await import("@/app/api/workbooks/[workbookId]/questions/route");
    const res = await GET(
      new Request("http://localhost/api/workbooks/py-value/questions?tags=統計"),
      { params: Promise.resolve({ workbookId: "py-value" }) }
    );
    expect(res.status).toBe(200);
  });

  it("TC-INT-05: tags=統計 で該当問題のみ返る", async () => {
    const { GET } = await import("@/app/api/workbooks/[workbookId]/questions/route");
    const res = await GET(
      new Request("http://localhost/api/workbooks/py-value/questions?tags=統計"),
      { params: Promise.resolve({ workbookId: "py-value" }) }
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    for (const q of json) {
      expect(q.tags).toBeDefined();
      expect(Array.isArray(q.tags)).toBe(true);
      expect(q.tags).toContain("統計");
    }
    const resAll = await GET(
      new Request("http://localhost/api/workbooks/py-value/questions"),
      { params: Promise.resolve({ workbookId: "py-value" }) }
    );
    const all = await resAll.json();
    expect(json.length).toBeLessThanOrEqual(all.length);
  });
});
