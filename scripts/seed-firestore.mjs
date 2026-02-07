/**
 * 本番 Firestore シード投入スクリプト（INFRA-01 §7.2）
 * 実行: node scripts/seed-firestore.mjs
 * 前提: GOOGLE_APPLICATION_CREDENTIALS または firebase-admin の初期化に必要な環境変数
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const workbooksPath = path.join(__dirname, "..", "data", "workbooks.json");
const questionsPath = path.join(__dirname, "..", "data", "questions.json");

async function main() {
  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : undefined;
  initializeApp(credential ? { credential } : {});
  const db = getFirestore();

  const workbooks = JSON.parse(readFileSync(workbooksPath, "utf-8"));
  for (const w of workbooks) {
    const { id, ...data } = w;
    await db.collection("workbooks").doc(id).set(data);
    console.log("workbooks:", id);
  }

  const questions = JSON.parse(readFileSync(questionsPath, "utf-8"));
  for (const q of questions) {
    const { id, ...rest } = q;
    await db.collection("questions").doc(id).set(rest);
    console.log("questions:", id);
  }

  console.log("Seed done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
