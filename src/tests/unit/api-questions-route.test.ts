/**
 * TC-014: API Route Handler（問題一覧）— GET /api/workbooks/:id/questions が sort, tags を正しく扱う
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/workbooks/[workbookId]/questions/route";

const mockListQuestions = vi.fn();

vi.mock("@/core/services/question-service", () => ({
  listQuestions: (...args: unknown[]) => mockListQuestions(...args),
}));

describe("GET /api/workbooks/[workbookId]/questions (TC-014)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when workbookId is missing", async () => {
    const res = await GET(
      new Request("http://localhost/api/workbooks/ /questions"),
      { params: Promise.resolve({ workbookId: "" }) }
    );
    expect(res.status).toBe(400);
  });

  it("returns questions with sort param", async () => {
    const questions = [
      { id: "q1", workbookId: "wb1", title: "Q1", type: "python-analysis", status: "published" },
    ];
    mockListQuestions.mockResolvedValue(questions);
    const res = await GET(
      new Request("http://localhost/api/workbooks/wb1/questions?sort=difficulty"),
      { params: Promise.resolve({ workbookId: "wb1" }) }
    );
    expect(res.status).toBe(200);
    expect(mockListQuestions).toHaveBeenCalledWith("wb1", "difficulty", undefined);
    const body = await res.json();
    expect(body).toEqual(questions);
  });

  it("passes tags from query string", async () => {
    mockListQuestions.mockResolvedValue([]);
    await GET(
      new Request("http://localhost/api/workbooks/wb1/questions?tags=統計,検定"),
      { params: Promise.resolve({ workbookId: "wb1" }) }
    );
    expect(mockListQuestions).toHaveBeenCalledWith("wb1", "order", ["統計", "検定"]);
  });

  it("TC-014: response includes favoriteCount when present", async () => {
    const questions = [
      {
        id: "q1",
        workbookId: "wb1",
        title: "Q1",
        type: "python-analysis",
        status: "published",
        favoriteCount: 5,
      },
    ];
    mockListQuestions.mockResolvedValue(questions);
    const res = await GET(
      new Request("http://localhost/api/workbooks/wb1/questions"),
      { params: Promise.resolve({ workbookId: "wb1" }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0].favoriteCount).toBe(5);
  });
});
