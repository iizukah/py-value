// TEST-01: TC-E2E-01, TC-E2E-02 — ホーム表示・問題集選択→一覧遷移（UC-F10, SC-000→SC-001）
import { test, expect } from "@playwright/test";

test.describe("TC-E2E-01: ルートでホーム表示", () => {
  test("ファーストビュー・問題集カードが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Exercise the Mind");
    await expect(
      page.getByText("Exercise the Mind", { exact: false })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Pythonデータ分析/ })
    ).toBeVisible();
  });
});

test.describe("TC-E2E-02: 問題集選択で一覧へ遷移", () => {
  test("Pythonデータ分析を選択すると問題一覧（SC-001）に遷移する", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Pythonデータ分析/ }).first().click();
    await page.waitForURL(/\/py-value$/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/py-value$/);
    await expect(page.locator("h1")).toContainText("Pythonデータ分析");
    await expect(
      page.locator('a[href^="/py-value/questions/"]').first()
    ).toBeVisible({ timeout: 15000 });
  });
});
