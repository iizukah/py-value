/**
 * Firestore 利用時に firebase-admin を初期化する（INFRA-01 §5）
 * Cloud Run では Application Default Credentials が使われる。
 */
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let initialized = false;

function ensureFirebaseAdmin() {
  if (initialized) return;
  if (getApps().length > 0) {
    initialized = true;
    return;
  }
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    "exir-27624";
  initializeApp({
    credential: applicationDefault(),
    projectId,
  });
  initialized = true;
}

/** Firestore を使う前に ensureFirebaseAdmin() が呼ばれていること。getFirestore のラッパー。 */
export function getFirestoreSafe() {
  ensureFirebaseAdmin();
  return getFirestore();
}
