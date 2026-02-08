/**
 * TC-INT-12: API-009 POST submit で JudgeResult が DATA-02 の型と一致して返る（TEST-01 §4.2）
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

vi.mock("@/core/services/question-service", () => ({
  getQuestionById: () =>
    Promise.resolve({
      id: "q1",
      workbookId: "py-value",
      title: "Q1",
      type: "python-analysis",
      status: "published",
      validation: { method: "value_match", expected_value: 1 },
    }),
}));

describe("POST /api/workbooks/[workbookId]/questions/[questionId]/submit", () => {
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

  it("returns JudgeResult with isCorrect and details", async () => {
    const { POST } = await import("@/app/api/workbooks/[workbookId]/questions/[questionId]/submit/route");
    const res = await POST(
      new Request("http://localhost/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Client-Id": "test-client" },
        body: JSON.stringify({ userAnswer: { cells: [{ id: "c1", content: "ans = 1" }] } }),
      }),
      { params: Promise.resolve({ workbookId: "py-value", questionId: "q1" }) }
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("isCorrect");
    expect(json).toHaveProperty("details");
    expect(typeof json.isCorrect).toBe("boolean");
  });
});
