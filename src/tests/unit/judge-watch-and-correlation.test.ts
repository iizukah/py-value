/**
 * TC-P05: 変数監視の値取得 — watchVariables で指定した変数の値を取得
 * TC-P06: Matplotlib 相関（r > 0.99）— 数値配列の相関係数を計算
 */
import { describe, it, expect } from "vitest";
import { getWatchVariableValues, computeCorrelation } from "@/core/plugins/python-analysis/judge";

describe("getWatchVariableValues (TC-P05)", () => {
  it("returns values for specified variable names", () => {
    const globals = {
      get(name: string): unknown {
        if (name === "ans") return 42;
        if (name === "p_value") return 0.01;
        return undefined;
      },
    };
    const out = getWatchVariableValues(globals, ["ans", "p_value"]);
    expect(out.ans).toBe(42);
    expect(out.p_value).toBe(0.01);
  });

  it("converts toJs() when present", () => {
    const globals = {
      get(_name: string): unknown {
        return { toJs: () => 100 };
      },
    };
    const out = getWatchVariableValues(globals, ["x"]);
    expect(out.x).toBe(100);
  });
});

describe("computeCorrelation (TC-P06)", () => {
  it("returns 1 for identical arrays", () => {
    const a = [1, 2, 3, 4, 5];
    const r = computeCorrelation(a, [...a]);
    expect(r).toBeCloseTo(1, 5);
  });

  it("returns r > 0.99 for highly correlated arrays", () => {
    const a = [1, 2, 3, 4, 5];
    const b = [1.1, 2.05, 2.9, 4.1, 4.95];
    const r = computeCorrelation(a, b);
    expect(r).toBeGreaterThan(0.99);
  });

  it("returns 0 for empty or length mismatch", () => {
    expect(computeCorrelation([], [])).toBe(0);
    expect(computeCorrelation([1, 2], [1])).toBe(0);
  });
});
