/**
 * TC-P02: runJudge タイムアウト — 60 秒超で details.kind: "timeout"
 * TC-P03: runJudge 実行エラー — 例外時に details.kind: "runtime_error"
 */
import { describe, it, expect } from "vitest";
import { withTimeout } from "@/core/plugins/python-analysis/judge";
import { runJudge } from "@/core/plugins/python-analysis/judge";
import type { Question } from "@/lib/types";

describe("withTimeout (TC-P02)", () => {
  it("returns 'timeout' when promise does not resolve within ms", async () => {
    const neverResolves = new Promise<number>(() => {});
    const result = await withTimeout(neverResolves, 20);
    expect(result).toBe("timeout");
  });

  it("returns value when promise resolves before ms", async () => {
    const result = await withTimeout(Promise.resolve(42), 100);
    expect(result).toBe(42);
  });
});

describe("runJudge runtime_error (TC-P03)", () => {
  it("returns runtime_error when run in Node (no window/Pyodide)", async () => {
    const question: Question = {
      id: "q1",
      title: "Q1",
      type: "python-analysis",
      status: "published",
      validation: { method: "value_match", expected_value: 1 },
    };
    const result = await runJudge(question, { cells: [{ id: "c1", content: "ans = 1" }] });
    expect(result.isCorrect).toBe(false);
    expect(result.details?.kind).toBe("runtime_error");
  });
});
