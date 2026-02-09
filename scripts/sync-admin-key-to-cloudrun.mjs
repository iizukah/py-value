#!/usr/bin/env node
/**
 * .env の ADMIN_KEY を Cloud Run の環境変数に反映する。
 * 管理画面を .env で設定したキーで閲覧できるようにする。
 * 実行: node scripts/sync-admin-key-to-cloudrun.mjs
 * 前提: ルートに .env があり、ADMIN_KEY と GOOGLE_CLOUD_PROJECT が設定されていること。gcloud 認証済みであること。
 */

import { readFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const root = process.cwd();
const envPath = join(root, ".env"); // .env は gitignore 済み

let envContent;
try {
  envContent = readFileSync(envPath, "utf8");
} catch (e) {
  console.error(".env を読み込めません。ルートに .env があるか確認してください。");
  process.exit(1);
}

const adminKeyMatch = envContent.match(/^\s*ADMIN_KEY\s*=\s*(.+)\s*$/m);
const projectMatch = envContent.match(/^\s*GOOGLE_CLOUD_PROJECT\s*=\s*(.+)\s*$/m);

const adminKey = adminKeyMatch ? adminKeyMatch[1].trim().replace(/^["']|["']$/g, "") : "";
const project = projectMatch ? projectMatch[1].trim().replace(/^["']|["']$/g, "") : "";

if (!adminKey) {
  console.error(".env に ADMIN_KEY が設定されていません。");
  process.exit(1);
}

const region = "asia-northeast1";
const serviceName = "exer-next";
const projectArg = project ? `--project=${project}` : "";

try {
  execSync(
    `gcloud run services update ${serviceName} --region=${region} ${projectArg} --update-env-vars=ADMIN_KEY=${adminKey}`,
    { stdio: "inherit", shell: true }
  );
  console.log("Cloud Run の ADMIN_KEY を .env の値に更新しました。管理画面は ?key=<.env の ADMIN_KEY> でアクセスできます。");
} catch (e) {
  console.error("gcloud の実行に失敗しました。gcloud がインストール・認証済みか、.env に GOOGLE_CLOUD_PROJECT が設定されているか確認してください。");
  process.exit(1);
}
