/**
 * TC-001: パンくず生成ユーティリティ
 */
import { describe, it, expect } from "vitest";
import { buildBreadcrumbs } from "@/lib/breadcrumb";

describe("buildBreadcrumbs", () => {
  it("returns home only for root", () => {
    const items = buildBreadcrumbs("/");
    expect(items).toEqual([{ label: "ホーム", href: "/" }]);
  });

  it("adds workbook with title", () => {
    const items = buildBreadcrumbs("/py-value", "Pythonデータ分析");
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: "ホーム", href: "/" });
    expect(items[1]).toEqual({ label: "Pythonデータ分析", href: "/py-value" });
  });

  it("adds question segment", () => {
    const items = buildBreadcrumbs("/py-value/questions/q1", "Pythonデータ分析");
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items[items.length - 1].href).toBe("/py-value/questions/q1");
  });
});
