/**
 * TC-002: プラグインレジストリ（FR-F017, FR-F022）
 */
import { describe, it, expect } from "vitest";
import { registerPlugin, getPlugin } from "@/core/plugins/registry";

const MockComponent = () => null;

describe("plugin registry", () => {
  it("returns null for unregistered type", () => {
    expect(getPlugin("unknown-type-xyz")).toBeNull();
  });

  it("returns registered plugin for type", () => {
    const judgeAdapter = {
      runJudge: async () => ({ isCorrect: true }),
    };
    registerPlugin("test-type", MockComponent, judgeAdapter);
    const plugin = getPlugin("test-type");
    expect(plugin).not.toBeNull();
    expect(plugin?.type).toBe("test-type");
    expect(plugin?.Component).toBe(MockComponent);
    expect(plugin?.judgeAdapter.runJudge).toBeDefined();
  });

  it("python-analysis is registered after register-plugins import", async () => {
    await import("@/core/plugins/register-plugins");
    const plugin = getPlugin("python-analysis");
    expect(plugin).not.toBeNull();
    expect(plugin?.type).toBe("python-analysis");
  }, 15000);
});
