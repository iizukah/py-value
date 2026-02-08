/**
 * 本番 Firestore シード投入スクリプト（INFRA-01 §7.2）
 * 実行: node scripts/seed-firestore.mjs
 * 前提: GOOGLE_APPLICATION_CREDENTIALS または firebase-admin の初期化に必要な環境変数
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const workbooksPath = path.join(__dirname, "..", "data", "workbooks.json");
const questionsPath = path.join(__dirname, "..", "data", "questions.json");

function getADCPath() {
  const base = process.env.APPDATA || (process.platform === "win32" ? path.join(process.env.HOMEPATH || "", "AppData", "Roaming") : path.join(process.env.HOME || "", ".config"));
  return path.join(base, "gcloud", "application_default_credentials.json");
}

async function main() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let credential;
  try {
    credential = credPath ? cert(credPath) : undefined;
  } catch (e) {
    throw e;
  }
  if (!credential) {
    const adcPath = getADCPath();
    if (!existsSync(adcPath)) {
      const err = new Error(
        "Firestore に接続するための認証情報がありません。\n" +
        "次のいずれかを実行してください:\n" +
        "  1) サービスアカウントキーを使う: GOOGLE_APPLICATION_CREDENTIALS に JSON ファイルのパスを設定してから再度実行\n" +
        "  2) アプリケーションのデフォルト認証を使う: ターミナルで gcloud auth application-default login を実行し、ブラウザでログインしてから再度実行"
      );
      err.code = "MISSING_CREDENTIALS";
      throw err;
    }
  }
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  initializeApp(credential ? { credential } : projectId ? { projectId } : {});
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
