/**
 * TC-010: 管理系 API キー検証（FR-F011）
 * key 未指定・不正時は 401。単体テスト可能な純粋関数。
 */

export function validateAdminKey(key: string | null | undefined): boolean {
  if (key == null || key.trim() === "") return false;
  const expected = process.env.ADMIN_API_KEY ?? "";
  return expected !== "" && key.trim() === expected;
}
