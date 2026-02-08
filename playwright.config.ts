// TEST-01 E2E: Playwright 設定（TC-E2E-01〜07 必須範囲）
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "src/tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      ...process.env,
      ADMIN_API_KEY: process.env.ADMIN_API_KEY ?? "test-admin-key",
    },
  },
});
