/**
 * TC-P01: runJudge value_match（ans のみ）
 * 判定ロジックの tolerance 比較を単体テスト（Pyodide はモック）
 */
import { describe, it, expect } from "vitest";

function compareWithTolerance(
  actual: number,
  expected: number,
  atol: number = 1e-5,
  rtol: number = 1e-3
): boolean {
  const diff = Math.abs(actual - expected);
  return diff <= atol + rtol * Math.abs(expected);
}

describe("value_match tolerance", () => {
  it("returns true when values are equal", () => {
    expect(compareWithTolerance(1.0, 1.0)).toBe(true);
  });

  it("returns true when within atol", () => {
    expect(compareWithTolerance(1.0, 1.0 + 1e-6, 1e-5, 1e-3)).toBe(true);
  });

  it("returns false when outside tolerance", () => {
    expect(compareWithTolerance(1.0, 1.1, 1e-5, 1e-3)).toBe(false);
  });
});
