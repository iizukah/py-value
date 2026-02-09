# 0046 本番 ADMIN_KEY を .env に同期するスクリプト

## 日付

2026-02-08

## 変更概要

- **事象**: 管理画面のキーが .env と本番環境（Cloud Run）でずれており、.env の設定で管理画面を閲覧できるようにする必要があった。
- **対応**:
  1. **scripts/sync-admin-key-to-cloudrun.mjs** を新規作成。ルートの `.env` から `ADMIN_KEY` と `GOOGLE_CLOUD_PROJECT` を読み取り、`gcloud run services update exer-next --region=asia-northeast1 --update-env-vars=ADMIN_KEY=...` で本番の Cloud Run の環境変数を更新する。
  2. **package.json** に `npm run sync-admin-key` を追加（上記スクリプトの実行）。
  3. **docs/02_manuals/02_デプロイマニュアル.md** のトラブルシューティングに「管理画面のキーが .env と本番でずれている場合」を追記。`node scripts/sync-admin-key-to-cloudrun.mjs` の実行手順を記載。
- **運用**: .env の ADMIN_KEY を変更したあと、本番でも同じキーで管理画面にアクセスしたい場合は、`npm run sync-admin-key` を実行する。

## 関連

- INFRA-01、02_デプロイマニュアル
- src/core/lib/admin-key.ts（ADMIN_API_KEY ?? ADMIN_KEY を参照）
