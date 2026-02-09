// TEST-01: TC-E2E-13 — キーボードのみで主要操作が実行できる（NFR-F004）

import { test, expect } from "@playwright/test";

test.describe("TC-E2E-13: キーボード操作", () => {
  test("問題一覧で Tab と Enter で問題を選択し、一覧へ戻るまでキーボードのみで操作できる", async ({
    page,
  }) => {
    await page.goto("/py-value");
    await expect(page.locator("h1")).toContainText("Pythonデータ分析");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const firstQuestionLink = page.locator('a[href^="/py-value/questions/"]').first();
    await expect(firstQuestionLink).toBeVisible({ timeout: 10000 });
    await firstQuestionLink.focus();
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/py-value\/questions\/.+/);
    await expect(page).toHaveURL(/\/py-value\/questions\/.+/);
    const backLink = page.getByRole("link", { name: "一覧へ戻る" });
    await backLink.focus();
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/py-value$/);
    await expect(page).toHaveURL(/\/py-value$/);
    await expect(page.locator("h1")).toContainText("Pythonデータ分析");
  });
});
