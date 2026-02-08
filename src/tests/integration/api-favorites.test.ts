/**
 * TC-INT-04: お気に入り追加（POST favorite）→ 一覧取得（GET favorites）で該当 questionId が含まれること、
 * 解除（DELETE favorite）後に一覧に含まれない（または count が減っている）ことを検証（TEST-01 §4.1）
 */
import { describe, it, expect, beforeAll } from "vitest";
import path from "path";
import { clearRepositoryCache } from "@/core/repositories";

describe("POST/DELETE favorite and GET favorites", () => {
  beforeAll(() => {
    process.env.DATA_SOURCE = "lowdb";
    process.env.LOWDB_PATH = path.join(process.cwd(), "data");
    clearRepositoryCache();
  });

  it("TC-INT-04: POST favorite → GET favorites に含まれる、DELETE 後に含まれない", async () => {
    const workbookId = "py-value";
    const questionId = "q1";
    const clientId = "fav-int-test-client";

    const { POST } = await import("@/app/api/workbooks/[workbookId]/questions/[questionId]/favorite/route");
    const { DELETE } = await import("@/app/api/workbooks/[workbookId]/questions/[questionId]/favorite/route");
    const { GET: GETFavorites } = await import("@/app/api/workbooks/[workbookId]/favorites/route");

    const postRes = await POST(
      new Request("http://localhost/favorite", {
        method: "POST",
        headers: { "X-Client-Id": clientId },
      }),
      { params: Promise.resolve({ workbookId, questionId }) }
    );
    expect(postRes.status).toBe(200);

    const listRes1 = await GETFavorites(
      new Request("http://localhost/favorites", { headers: { "X-Client-Id": clientId } }),
      { params: Promise.resolve({ workbookId }) }
    );
    expect(listRes1.status).toBe(200);
    const list1 = await listRes1.json();
    const ids1 = (Array.isArray(list1) ? list1 : []).map((f: { questionId: string }) => f.questionId);
    expect(ids1).toContain(questionId);

    const delRes = await DELETE(
      new Request("http://localhost/favorite", {
        method: "DELETE",
        headers: { "X-Client-Id": clientId },
      }),
      { params: Promise.resolve({ workbookId, questionId }) }
    );
    expect(delRes.status).toBe(200);

    const listRes2 = await GETFavorites(
      new Request("http://localhost/favorites", { headers: { "X-Client-Id": clientId } }),
      { params: Promise.resolve({ workbookId }) }
    );
    expect(listRes2.status).toBe(200);
    const list2 = await listRes2.json();
    const ids2 = (Array.isArray(list2) ? list2 : []).map((f: { questionId: string }) => f.questionId);
    expect(ids2).not.toContain(questionId);
  });
});
