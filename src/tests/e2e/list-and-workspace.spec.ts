// TEST-01: TC-E2E-03, TC-E2E-04, TC-E2E-05, TC-E2E-06, TC-E2E-07 — 問題一覧・ワークスペース・採点結果・完了画面・一覧へ戻る

import { test, expect } from "@playwright/test";

const firstQuestionLink = (page: import("@playwright/test").Page) =>
  page.locator('a[href^="/py-value/questions/"]').first();

test.describe("TC-E2E-03: 問題一覧でソート・カード選択", () => {
  test("ソートリンクが表示され、カードから問題を選択できる", async ({ page }) => {
    await page.goto("/py-value");
    await expect(page.locator("h1")).toHaveText("Pythonデータ分析");
    await expect(page.getByText("登録順")).toBeVisible();
    await expect(page.getByText("お気に入り数")).toBeVisible();
    await expect(firstQuestionLink(page)).toBeVisible({ timeout: 15000 });
    await firstQuestionLink(page).click();
    await page.waitForURL(/\/py-value\/questions\/.+/);
    await expect(page).toHaveURL(/\/py-value\/questions\/.+/);
  });
});

test.describe("TC-E2E-04: 問題選択でワークスペースへ遷移", () => {
  test("問題を選択するとワークスペース（SC-002）に遷移する", async ({ page }) => {
    await page.goto("/py-value");
    await expect(firstQuestionLink(page)).toBeVisible({ timeout: 15000 });
    await firstQuestionLink(page).click();
    await page.waitForURL(/\/py-value\/questions\/.+/);
    await expect(page).toHaveURL(/\/py-value\/questions\/.+/);
    await expect(page.getByRole("button", { name: /実行・採点|採点中/ })).toBeVisible();
  });
});

test.describe("TC-E2E-05: 解答送信後採点結果表示", () => {
  test("解答送信後、採点結果が表示される（ローディング後バッジ・Retry/一覧へ戻る）", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.goto("/py-value");
    await expect(firstQuestionLink(page)).toBeVisible({ timeout: 15000 });
    await firstQuestionLink(page).click();
    await page.waitForURL(/\/py-value\/questions\/.+/);
    await expect(page).toHaveURL(/\/py-value\/questions\/.+/);
    const runButton = page.getByRole("button", { name: /実行・採点|採点中/ });
    await runButton.click();
    const passedOrFail = page.getByText(/Passed|Fail/);
    await expect(passedOrFail).toBeVisible({ timeout: 60000 });
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: "一覧へ戻る" })).toBeVisible();
  });
});

test.describe("TC-E2E-06: 完了画面（SC-004）", () => {
  test("完了画面に遷移すると完了メッセージと一覧へ戻るが表示される", async ({
    page,
  }) => {
    await page.goto("/py-value/complete");
    await expect(page).toHaveURL(/\/py-value\/complete/);
    await expect(
      page.getByRole("heading", { name: "お疲れさまです" })
    ).toBeVisible();
    await expect(
      page.getByText("このワークブックの全問題に正解しました。")
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "一覧へ戻る" })
    ).toBeVisible();
  });
});

test.describe("TC-E2E-07: 一覧へ戻る", () => {
  test("一覧へ戻るで問題一覧に戻る", async ({ page }) => {
    await page.goto("/py-value");
    await expect(firstQuestionLink(page)).toBeVisible({ timeout: 15000 });
    await firstQuestionLink(page).click();
    await page.waitForURL(/\/py-value\/questions\/.+/);
    await expect(page).toHaveURL(/\/py-value\/questions\/.+/);
    await page.getByRole("link", { name: "一覧へ戻る" }).click();
    await page.waitForURL(/\/py-value$/);
    await expect(page).toHaveURL(/\/py-value$/);
    await expect(page.locator("h1")).toHaveText("Pythonデータ分析");
  });
});
