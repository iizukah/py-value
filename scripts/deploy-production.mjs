#!/usr/bin/env node
/**
 * .env を読み、Cloud Build で Cloud Run にデプロイし、続けて Firebase Hosting と Firestore をデプロイする。
 * 実行: node scripts/deploy-production.mjs（プロジェクトルートで）
 * 前提: .env に ADMIN_KEY, GOOGLE_CLOUD_PROJECT が設定されていること。gcloud と firebase CLI が認証済みであること。
 */

import { readFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const root = process.cwd();
const envPath = join(root, ".env");

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

if (!adminKey || !project) {
  console.error(".env に ADMIN_KEY と GOOGLE_CLOUD_PROJECT を設定してください。");
  process.exit(1);
}

console.log("Cloud Build で Cloud Run にデプロイします...");
try {
  execSync(
    `gcloud builds submit --config=cloudbuild.yaml --substitutions=_ADMIN_KEY=${adminKey},_GOOGLE_CLOUD_PROJECT=${project}`,
    { stdio: "inherit", shell: true, cwd: root }
  );
} catch (e) {
  console.error("Cloud Build に失敗しました。");
  process.exit(1);
}

console.log("Firebase Hosting と Firestore をデプロイします...");
try {
  execSync(`firebase use ${project}`, { stdio: "inherit", shell: true, cwd: root });
  execSync('firebase deploy --only "hosting,firestore"', { stdio: "inherit", shell: true, cwd: root });
} catch (e) {
  console.error("Firebase デプロイに失敗しました。");
  process.exit(1);
}

console.log("デプロイが完了しました。");
