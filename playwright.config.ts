// TEST-01, TEST-02 E2E: Playwright 設定（TC-E2E-01〜13 / 本番環境 E2E）
import { defineConfig, devices } from "@playwright/test";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// E2E 実行時に .env を読み、ADMIN_KEY/ADMIN_API_KEY を test と webServer で揃える
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const isProduction = !!process.env.BASE_URL;

export default defineConfig({
  testDir: "src/tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  timeout: isProduction ? 60_000 : undefined,
  ...(isProduction
    ? { workers: 1 }
    : {}),
  ...(isProduction
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
          env: {
            ...process.env,
            ADMIN_API_KEY: process.env.ADMIN_API_KEY ?? process.env.ADMIN_KEY ?? "test-admin-key",
            ADMIN_KEY: process.env.ADMIN_KEY ?? process.env.ADMIN_API_KEY ?? "test-admin-key",
          },
        },
      }),
});
