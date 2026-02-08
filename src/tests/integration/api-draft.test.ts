/**
 * TC-INT-02: 下書き保存（PUT draft）→ 再表示（GET draft）で同一 body が返る（TEST-01 §4.1）
 */
import { describe, it, expect, beforeAll } from "vitest";
import path from "path";
import { clearRepositoryCache } from "@/core/repositories";

describe("PUT/GET /api/workbooks/[workbookId]/questions/[questionId]/draft", () => {
  beforeAll(() => {
    process.env.DATA_SOURCE = "lowdb";
    process.env.LOWDB_PATH = path.join(process.cwd(), "data");
    clearRepositoryCache();
  });

  it("TC-INT-02: PUT draft 後に GET で同一 userAnswer が返る", async () => {
    const { PUT, GET } = await import("@/app/api/workbooks/[workbookId]/questions/[questionId]/draft/route");
    const workbookId = "py-value";
    const questionId = "q1";
    const clientId = "draft-test-client";
    const userAnswer = { cells: [{ id: "1", content: "ans = 42" }] };

    const putRes = await PUT(
      new Request("http://localhost/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Client-Id": clientId },
        body: JSON.stringify({ userAnswer }),
      }),
      { params: Promise.resolve({ workbookId, questionId }) }
    );
    expect(putRes.status).toBe(200);
    const putJson = await putRes.json();
    expect(putJson.userAnswer).toEqual(userAnswer);

    const getRes = await GET(
      new Request("http://localhost/draft", {
        headers: { "X-Client-Id": clientId },
      }),
      { params: Promise.resolve({ workbookId, questionId }) }
    );
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.userAnswer).toEqual(userAnswer);
  });
});
