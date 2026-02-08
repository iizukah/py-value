/**
 * TC-010: 管理系 API キー検証 — key 未指定・不正時に 401 相当（false）、正しければ true
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateAdminKey } from "@/core/lib/admin-key";

describe("validateAdminKey (TC-010)", () => {
  const origApi = process.env.ADMIN_API_KEY;
  const origKey = process.env.ADMIN_KEY;

  afterEach(() => {
    process.env.ADMIN_API_KEY = origApi;
    process.env.ADMIN_KEY = origKey;
  });

  it("returns false when key is missing", () => {
    process.env.ADMIN_API_KEY = "secret";
    expect(validateAdminKey(null)).toBe(false);
    expect(validateAdminKey(undefined)).toBe(false);
    expect(validateAdminKey("")).toBe(false);
  });

  it("returns false when key is wrong", () => {
    process.env.ADMIN_API_KEY = "secret";
    expect(validateAdminKey("wrong")).toBe(false);
  });

  it("returns true when key matches", () => {
    process.env.ADMIN_API_KEY = "secret";
    expect(validateAdminKey("secret")).toBe(true);
  });

  it("returns false when ADMIN_API_KEY is not set", () => {
    delete process.env.ADMIN_API_KEY;
    delete process.env.ADMIN_KEY;
    expect(validateAdminKey("anything")).toBe(false);
  });

  it("returns true when key matches ADMIN_KEY and ADMIN_API_KEY is not set", () => {
    delete process.env.ADMIN_API_KEY;
    process.env.ADMIN_KEY = "mykey";
    expect(validateAdminKey("mykey")).toBe(true);
  });
});
