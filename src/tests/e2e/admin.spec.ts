// TEST-01: TC-E2E-11, TC-E2E-12 — 管理画面導線（UC-F07, UC-F08, SC-007→SC-008, SC-009, SC-010）

import { test, expect } from "@playwright/test";

const ADMIN_KEY = process.env.ADMIN_API_KEY ?? process.env.ADMIN_KEY ?? "test-admin-key";
const ADMIN_URL = `/admin?key=${encodeURIComponent(ADMIN_KEY)}`;
const PY_VALUE_ADMIN = `/admin/py-value?key=${encodeURIComponent(ADMIN_KEY)}`;

test.describe("TC-E2E-11: 管理ダッシュボード→問題登録エディタ", () => {
  test("管理（?key=xxx）でダッシュボード（SC-007）が表示され、問題登録エディタ（SC-008）へ遷移できる", async ({
    page,
  }) => {
    await page.goto(ADMIN_URL);
    await expect(page.locator("h1")).toHaveText("管理ダッシュボード");
    await expect(page.getByRole("link", { name: "インポート/エクスポート" })).toBeVisible();
    await expect(page.getByRole("link", { name: "新規作成" })).toBeVisible();
    await page.getByRole("link", { name: "新規作成" }).click();
    await page.waitForURL(/\/admin\/py-value\/questions\/new\?key=/);
    await expect(page.locator("h1")).toHaveText("問題を新規作成");
    await expect(page.getByLabel("タイトル")).toBeVisible();
  });

  test("ダッシュボードで編集リンクをクリックするとエディタ（SC-008）に遷移する", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.goto(PY_VALUE_ADMIN);
    await expect(page.locator("h1")).toHaveText("管理ダッシュボード");
    await expect(page.getByText("読み込み中...")).not.toBeVisible({ timeout: 35000 });
    if (await page.getByText("キーが無効です").isVisible()) {
      test.skip();
    }
    await expect(
      page.getByRole("table").or(page.getByText("問題がありません"))
    ).toBeVisible({ timeout: 10000 });
    const noQuestions = page.getByText("問題がありません");
    const editLink = page.getByRole("link", { name: "編集" }).first();
    if (await noQuestions.isVisible()) {
      return;
    }
    await expect(editLink).toBeVisible({ timeout: 5000 });
    await editLink.click();
    await expect(page).toHaveURL(/\/questions\/.+\/edit\?key=/, { timeout: 45000 });
    await expect(page.locator("h1")).toHaveText("問題を編集");
  });
});

test.describe("TC-E2E-12: インポート/エクスポート・データセット導線", () => {
  test("管理ダッシュボードからインポート/エクスポート（SC-009）への導線が動作する", async ({
    page,
  }) => {
    await page.goto(PY_VALUE_ADMIN);
    await page.getByRole("link", { name: "インポート/エクスポート" }).click();
    await page.waitForURL(/\/admin\/py-value\/import\?key=/);
    await expect(page.locator("h1")).toHaveText("インポート/エクスポート");
    await expect(page.getByRole("button", { name: "エクスポート実行" })).toBeVisible();
  });

  test("管理ダッシュボードからデータセットアップロード（SC-010）への導線が動作する", async ({
    page,
  }) => {
    await page.goto(PY_VALUE_ADMIN);
    await page.getByRole("link", { name: "データセットアップロード" }).click();
    await page.waitForURL(/\/admin\/py-value\/datasets\?key=/);
    await expect(page.locator("h1")).toHaveText("データセットアップロード");
    await expect(page.getByLabel("CSV またはテキストファイルを選択")).toBeVisible();
  });
});
