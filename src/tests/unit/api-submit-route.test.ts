/**
 * TC-015: API Route Handler（解答送信）— POST submit、userAnswer、JudgeResult、X-Client-Id 必須
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/workbooks/[workbookId]/questions/[questionId]/submit/route";

const mockSubmitAnswer = vi.fn();

vi.mock("@/core/services/submit-service", () => ({
  submitAnswer: (...args: unknown[]) => mockSubmitAnswer(...args),
}));

describe("POST submit (TC-015)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when X-Client-Id is missing", async () => {
    const res = await POST(
      new Request("http://localhost/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAnswer: { cells: [] } }),
      }),
      { params: Promise.resolve({ workbookId: "wb1", questionId: "q1" }) }
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toContain("X-Client-Id");
  });

  it("returns JudgeResult when X-Client-Id and userAnswer provided", async () => {
    const judgeResult = { isCorrect: true, message: "正解です。" };
    mockSubmitAnswer.mockResolvedValue(judgeResult);

    const res = await POST(
      new Request("http://localhost/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Id": "client1",
        },
        body: JSON.stringify({ userAnswer: { cells: [{ id: "c1", content: "ans = 1" }] } }),
      }),
      { params: Promise.resolve({ workbookId: "wb1", questionId: "q1" }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(judgeResult);
    expect(mockSubmitAnswer).toHaveBeenCalledWith(
      "wb1",
      "q1",
      "client1",
      expect.objectContaining({ cells: expect.any(Array) })
    );
  });

  it("returns 400 when userAnswer is missing", async () => {
    const res = await POST(
      new Request("http://localhost/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Client-Id": "client1" },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ workbookId: "wb1", questionId: "q1" }) }
    );
    expect(res.status).toBe(400);
  });
});
