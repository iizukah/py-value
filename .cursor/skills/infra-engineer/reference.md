# 環境変数・シークレットの管理（EXER）

## 開発環境
- テンプレート: **docs/01_specs/06_operations/env.example** をルートにコピーして **.env** を作成する。
- .env はリポジトリにコミットしない（.gitignore 済み）。
- 開発時に必要な変数:
  - **DATA_SOURCE**: `lowdb`（開発）| `firestore`（本番）
  - **LOWDB_PATH**: Lowdb 用 JSON を置くディレクトリ（例: `./data`）
  - **ADMIN_KEY**: 管理 API のクエリ key（?key=xxx）。ローカル用の任意文字列でよい。
  - **NODE_ENV**: `development`

## 本番環境（Firebase）
- 本番の環境変数・シークレットは **Firebase Console**（プロジェクトの設定 > 環境変数）または Cloud Functions の設定で行う。
- 設定すべきキー: **DATA_SOURCE**=firestore, **ADMIN_KEY**（管理画面用）。Firebase プロジェクト ID 等は SDK のデフォルトでよい。
- Firebase プロジェクトの新規作成: [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成し、Hosting / Firestore / Functions を有効化する。その後 `firebase use --add` でプロジェクトを紐づける。

## Firebase デプロイ（初回）
1. Firebase CLI: `npm install -g firebase-tools` 後、`firebase login`。
2. プロジェクト作成後、ルートで `firebase use --add` でプロジェクト ID を選択。
3. Next を静的 export する場合: `npm run build` と `next export`（または next.config で output: 'export'）で `out` を生成し、`firebase deploy --only hosting`。
4. Next を Cloud Functions で動かす場合: 別途 Next.js 用 Firebase アダプタまたは Cloud Functions での Next サーバー起動を構成する（docs/01_specs/06_operations/INFRA-01 を参照）。
5. 本番シード投入: デプロイ後、`node scripts/seed-firestore.mjs` を実行（GOOGLE_APPLICATION_CREDENTIALS または firebase use 済み）。投入先: Firestore の `workbooks`, `questions`。手順は docs/01_specs/06_operations/seed/README.md を参照。

## 環境の区別
- 開発/本番で DATA_SOURCE を切り替え、接続先（Lowdb vs Firestore）を変更する。
- 本番への反映手順・ロールバック方針は、docs/99_history で管理する。
