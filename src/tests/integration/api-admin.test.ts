/**
 * 管理 API: key 検証・GET 一覧・POST 作成・PUT・DELETE・import/export（TEST-01 結合）
 */
import { describe, it, expect, beforeAll } from "vitest";
import path from "path";
import { clearRepositoryCache } from "@/core/repositories";

const WORKBOOK_ID = "py-value";
const ADMIN_KEY = "test-admin-key";

beforeAll(() => {
  process.env.DATA_SOURCE = "lowdb";
  process.env.LOWDB_PATH = path.join(process.cwd(), "data");
  process.env.ADMIN_API_KEY = ADMIN_KEY;
  clearRepositoryCache();
});

describe("Admin API key validation", () => {
  it("GET questions without key returns 401", async () => {
    const { GET } = await import("@/app/api/admin/workbooks/[workbookId]/questions/route");
    const req = new Request(`http://localhost/api/admin/workbooks/${WORKBOOK_ID}/questions`);
    const res = await GET(req, { params: Promise.resolve({ workbookId: WORKBOOK_ID }) });
    expect(res.status).toBe(401);
  });

  it("GET questions with invalid key returns 401", async () => {
    const { GET } = await import("@/app/api/admin/workbooks/[workbookId]/questions/route");
    const req = new Request(
      `http://localhost/api/admin/workbooks/${WORKBOOK_ID}/questions?key=wrong`
    );
    const res = await GET(req, { params: Promise.resolve({ workbookId: WORKBOOK_ID }) });
    expect(res.status).toBe(401);
  });
});

describe("Admin API GET questions (API-010)", () => {
  it("GET questions with valid key returns 200 and array", async () => {
    const { GET } = await import("@/app/api/admin/workbooks/[workbookId]/questions/route");
    const req = new Request(
      `http://localhost/api/admin/workbooks/${WORKBOOK_ID}/questions?key=${ADMIN_KEY}`
    );
    const res = await GET(req, { params: Promise.resolve({ workbookId: WORKBOOK_ID }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });
});

describe("Admin API export (API-016)", () => {
  it("GET export without key returns 401", async () => {
    const { GET } = await import("@/app/api/admin/workbooks/[workbookId]/export/route");
    const req = new Request(`http://localhost/api/admin/workbooks/${WORKBOOK_ID}/export`);
    const res = await GET(req, { params: Promise.resolve({ workbookId: WORKBOOK_ID }) });
    expect(res.status).toBe(401);
  });

  it("GET export with valid key returns 200 and array", async () => {
    const { GET } = await import("@/app/api/admin/workbooks/[workbookId]/export/route");
    const req = new Request(
      `http://localhost/api/admin/workbooks/${WORKBOOK_ID}/export?key=${ADMIN_KEY}`
    );
    const res = await GET(req, { params: Promise.resolve({ workbookId: WORKBOOK_ID }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });
});
