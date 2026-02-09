// TEST-01: TC-E2E-08 — ヘッダから履歴へ遷移し、履歴一覧・詳細を表示できる（UC-F06, SC-005→SC-006）

import { test, expect } from "@playwright/test";

test.describe("TC-E2E-08: 履歴一覧・詳細", () => {
  test("ヘッダから履歴をクリックすると履歴一覧（SC-005）に遷移する", async ({
    page,
  }) => {
    await page.goto("/py-value");
    await page.getByRole("link", { name: "履歴" }).click();
    await page.waitForURL(/\/py-value\/history$/);
    await expect(page).toHaveURL(/\/py-value\/history$/);
    await expect(page.locator("h1")).toHaveText("履歴");
    await expect(
      page.getByRole("link", { name: "一覧へ戻る" }).or(page.getByText("履歴はありません"))
    ).toBeVisible({ timeout: 10000 });
  });

  test("履歴一覧で1件クリックすると詳細（SC-006）に遷移する", async ({
    page,
  }) => {
    await page.goto("/py-value/history");
    await expect(page.locator("h1")).toHaveText("履歴");
    const historyLink = page.getByRole("link", { name: /問題 .+/ }).first();
    const count = await historyLink.count();
    if (count === 0) {
      await expect(page.getByText("履歴はありません")).toBeVisible();
      return;
    }
    await historyLink.click();
    await page.waitForURL(/\/py-value\/history\/.+/);
    await expect(page).toHaveURL(/\/py-value\/history\/.+/);
    await expect(page.getByRole("link", { name: "一覧へ戻る" })).toBeVisible();
  });
});
