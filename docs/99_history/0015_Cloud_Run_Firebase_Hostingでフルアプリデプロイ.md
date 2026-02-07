# 0015 Cloud Run + Firebase Hosting でフルアプリデプロイ（インターネット動作確認）

## 日付

2026-02-07

## 実施内容

- **目的**: 「デプロイしてインターネット経由でアクセスし、動作確認できる」状態にする。Firebase メインで完結。
- **構成**: Next.js を **Cloud Run**（asia-northeast1）で実行し、**Firebase Hosting** の全リクエストを Cloud Run に rewrites で転送。
- **追加・変更**:
  - **Dockerfile**: node:20-slim マルチステージビルド。ビルド後に npm prune --production で本番用 node_modules のみ runner にコピー。
  - **.dockerignore**: ビルドに必要な `data/` をコピーするため data の除外を解除（コメントで理由を記載）。
  - **firebase.json**: Hosting の `public` を `static` に変更。`rewrites` で `**` を Cloud Run サービス `exer-next`（asia-northeast1）に転送。functions ブロックを削除。
  - **static/.gitkeep**: Hosting 用の public ディレクトリとして作成。
  - **docs/02_manuals/02_デプロイマニュアル.md**: §2 を Cloud Run + Hosting の構成に更新。§5.2 に Cloud Run API を追加。§7 に「Cloud Run + Firebase Hosting のデプロイ手順」を追加（gcloud run deploy と firebase deploy の順序・環境変数）。
  - **package-lock.json**: `npm install` で同期（Cloud Build の npm ci が lock 不整合で失敗したため修正）。

## デプロイ結果

- **Cloud Run**: サービス `exer-next` を snap-mark プロジェクト・asia-northeast1 にデプロイ済み。  
  - URL: https://exer-next-692532343626.asia-northeast1.run.app  
  - 環境変数: DATA_SOURCE=firestore, ADMIN_KEY=exer-admin-placeholder（本番では人間が値を設定すること）。
- **Firebase Hosting**: `firebase deploy --only "hosting,firestore"` でデプロイ済み。  
  - URL: https://snap-mark.web.app  
  - ホーム（/）は表示確認済み。問題一覧（/py-value）は Firestore にシードデータが無い場合は空になる。

## シードデータについて

- `node scripts/seed-firestore.mjs` の実行には **Application Default Credentials**（`gcloud auth application-default login`）または **GOOGLE_APPLICATION_CREDENTIALS** の設定が必要。未設定のため本作業ではシード投入は未実施。認証を用意したうえで手動実行すると、問題一覧にデータが表示される。

## 関連ドキュメント

- INFRA-01
- docs/02_manuals/02_デプロイマニュアル.md
- Dockerfile, firebase.json
