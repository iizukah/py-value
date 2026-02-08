/**
 * TC-P04: セル結合 — 複数セルのコードを結合して 1 スクリプトとして実行する
 */
import { describe, it, expect } from "vitest";
import { getCombinedCode } from "@/core/plugins/python-analysis/judge";

describe("getCombinedCode (TC-P04)", () => {
  it("joins multiple cells with double newline", () => {
    const userAnswer = {
      cells: [
        { id: "c1", content: "x = 1" },
        { id: "c2", content: "y = 2" },
        { id: "c3", content: "ans = x + y" },
      ],
    };
    expect(getCombinedCode(userAnswer)).toBe("x = 1\n\ny = 2\n\nans = x + y");
  });

  it("returns empty string when cells is empty", () => {
    expect(getCombinedCode({ cells: [] })).toBe("");
  });

  it("returns empty string when cells is undefined", () => {
    expect(getCombinedCode({})).toBe("");
  });

  it("single cell returns its content", () => {
    expect(getCombinedCode({ cells: [{ id: "c1", content: "ans = 42" }] })).toBe("ans = 42");
  });

  /** TC-P07: initial_code が空のとき空 1 セルとして扱う → getCombinedCode は空文字を返す */
  it("TC-P07: single cell with empty content returns empty string", () => {
    expect(getCombinedCode({ cells: [{ id: "1", content: "" }] })).toBe("");
  });
});
