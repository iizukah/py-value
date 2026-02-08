/**
 * TC-INT-01: 問題取得 → プラグイン表示 → 解答送信 → 採点結果表示の一連フロー（TEST-01 §4.1）
 * GET questions → GET question by id → POST submit を呼び、レスポンスの JudgeResult を検証する。
 */
import { describe, it, expect, beforeAll, vi } from "vitest";
import path from "path";
import { clearRepositoryCache } from "@/core/repositories";

const mockRunJudge = vi.fn();

vi.mock("@/core/plugins/registry", () => ({
  getPlugin: () => ({
    judgeAdapter: { runJudge: mockRunJudge },
  }),
}));

describe("TC-INT-01: 問題取得 → 解答送信 → 採点結果", () => {
  beforeAll(() => {
    process.env.DATA_SOURCE = "lowdb";
    process.env.LOWDB_PATH = path.join(process.cwd(), "data");
    clearRepositoryCache();
    mockRunJudge.mockResolvedValue({
      isCorrect: true,
      message: "正解です。",
      details: { kind: "value_match", expected: 1, actual: 1 },
    });
  });

  it("GET questions → GET question by id → POST submit で JudgeResult が返る", async () => {
    const { GET: GETQuestions } = await import("@/app/api/workbooks/[workbookId]/questions/route");
    const { GET: GETQuestion } = await import("@/app/api/workbooks/[workbookId]/questions/[questionId]/route");
    const { POST } = await import("@/app/api/workbooks/[workbookId]/questions/[questionId]/submit/route");

    const listRes = await GETQuestions(
      new Request("http://localhost/api/workbooks/py-value/questions"),
      { params: Promise.resolve({ workbookId: "py-value" }) }
    );
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(Array.isArray(list)).toBe(true);
    const firstId = list[0]?.id;
    expect(firstId).toBeDefined();

    const questionRes = await GETQuestion(
      new Request("http://localhost/api/workbooks/py-value/questions/" + firstId),
      { params: Promise.resolve({ workbookId: "py-value", questionId: firstId }) }
    );
    expect(questionRes.status).toBe(200);
    const question = await questionRes.json();
    expect(question.id).toBe(firstId);
    expect(question.validation).toBeDefined();

    const submitRes = await POST(
      new Request("http://localhost/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Client-Id": "flow-test-client" },
        body: JSON.stringify({ userAnswer: { cells: [{ id: "1", content: "ans = 1" }] } }),
      }),
      { params: Promise.resolve({ workbookId: "py-value", questionId: firstId }) }
    );
    expect(submitRes.status).toBe(200);
    const judgeResult = await submitRes.json();
    expect(judgeResult).toHaveProperty("isCorrect");
    expect(judgeResult).toHaveProperty("details");
    expect(typeof judgeResult.isCorrect).toBe("boolean");
    expect(judgeResult.isCorrect).toBe(true);
  });
});
