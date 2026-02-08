/**
 * TC-003, TC-004: QuestionService（一覧・ソート・0件時）
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { listQuestions, getQuestionById } from "@/core/services/question-service";
import type { Question } from "@/lib/types";

const mockListByWorkbookId = vi.fn();
const mockGetById = vi.fn();
const mockCountByQuestion = vi.fn();

vi.mock("@/core/repositories", () => ({
  getQuestionRepository: () => ({
    listByWorkbookId: mockListByWorkbookId,
    getById: mockGetById,
  }),
  getFavoriteRepository: () => ({
    countByQuestion: mockCountByQuestion,
  }),
}));

describe("QuestionService (TC-003, TC-004)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-003: listQuestions passes sort and tags to repository", async () => {
    const questions: Question[] = [
      { id: "q1", workbookId: "wb1", title: "Q1", type: "python-analysis", status: "published", order: 1 },
    ];
    mockListByWorkbookId.mockResolvedValue(questions);
    mockCountByQuestion.mockResolvedValue(0);
    const result = await listQuestions("wb1", "title", ["統計"]);
    expect(mockListByWorkbookId).toHaveBeenCalledWith({
      workbookId: "wb1",
      sort: "title",
      tags: ["統計"],
    });
    expect(result[0].favoriteCount).toBe(0);
  });

  it("TC-004: listQuestions returns empty array when repository returns 0 items", async () => {
    mockListByWorkbookId.mockResolvedValue([]);
    const result = await listQuestions("wb1", "order");
    expect(result).toEqual([]);
  });

  it("getQuestionById returns null when repository returns null", async () => {
    mockGetById.mockResolvedValue(null);
    const result = await getQuestionById("wb1", "q1");
    expect(result).toBeNull();
  });
});
