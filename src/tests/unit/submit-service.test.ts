/**
 * TC-008: 解答送信フロー（枠組み側）— runJudge 呼び出し・JudgeResult 履歴保存・返却
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitAnswer } from "@/core/services/submit-service";

const mockGetQuestionById = vi.fn();
const mockGetPlugin = vi.fn();
const mockSaveHistory = vi.fn();

vi.mock("@/core/services/question-service", () => ({
  getQuestionById: (...args: unknown[]) => mockGetQuestionById(...args),
}));

vi.mock("@/core/plugins/registry", () => ({
  getPlugin: (...args: unknown[]) => mockGetPlugin(...args),
}));

vi.mock("@/core/services/history-service", () => ({
  saveHistory: (...args: unknown[]) => mockSaveHistory(...args),
}));

describe("submitAnswer (TC-008)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls runJudge and saves history then returns JudgeResult", async () => {
    const question = {
      id: "q1",
      workbookId: "wb1",
      title: "Q1",
      type: "python-analysis",
      status: "published" as const,
    };
    const judgeResult = { isCorrect: true, message: "正解です。" };
    mockGetQuestionById.mockResolvedValue(question);
    mockGetPlugin.mockReturnValue({
      judgeAdapter: { runJudge: vi.fn().mockResolvedValue(judgeResult) },
    });

    const result = await submitAnswer("wb1", "q1", "client1", { cells: [] });

    expect(result).toEqual(judgeResult);
    expect(mockSaveHistory).toHaveBeenCalledTimes(1);
    const saved = mockSaveHistory.mock.calls[0][0];
    expect(saved.workbookId).toBe("wb1");
    expect(saved.questionId).toBe("q1");
    expect(saved.clientId).toBe("client1");
    expect(saved.status).toBe("submitted");
    expect(saved.isCorrect).toBe(true);
  });

  it("returns judge_error when question not found", async () => {
    mockGetQuestionById.mockResolvedValue(null);

    const result = await submitAnswer("wb1", "q1", "client1", {});

    expect(result.isCorrect).toBe(false);
    expect(result.details?.kind).toBe("judge_error");
    expect(mockSaveHistory).not.toHaveBeenCalled();
  });
});
