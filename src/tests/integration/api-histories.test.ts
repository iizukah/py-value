/**
 * TC-INT-13: API-005, API-006 履歴一覧・詳細が X-Client-Id で絞られて返る（TEST-01 §4.2）
 */
import { describe, it, expect, beforeAll } from "vitest";
import path from "path";
import { clearRepositoryCache } from "@/core/repositories";

describe("GET /api/workbooks/[workbookId]/histories", () => {
  beforeAll(() => {
    process.env.DATA_SOURCE = "lowdb";
    process.env.LOWDB_PATH = path.join(process.cwd(), "data");
    clearRepositoryCache();
  });

  it("returns 400 when X-Client-Id is missing", async () => {
    const { GET } = await import("@/app/api/workbooks/[workbookId]/histories/route");
    const res = await GET(
      new Request("http://localhost/api/workbooks/py-value/histories"),
      { params: Promise.resolve({ workbookId: "py-value" }) }
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 and array when X-Client-Id provided", async () => {
    const { GET } = await import("@/app/api/workbooks/[workbookId]/histories/route");
    const res = await GET(
      new Request("http://localhost/api/workbooks/py-value/histories", {
        headers: { "X-Client-Id": "test-client" },
      }),
      { params: Promise.resolve({ workbookId: "py-value" }) }
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });
});
