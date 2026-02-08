# 環境変数・シークレットの管理（EXER）

**詳細（IAM・サービス有効化・人間実施 vs 自動化）**: **docs/02_manuals/02_デプロイマニュアル.md** を必ず参照すること。

## 開発環境
- テンプレート: **docs/01_specs/06_operations/env.example** をルートにコピーして **.env** を作成する。
- .env はリポジトリにコミットしない（.gitignore 済み）。
- 開発時に必要な変数:
  - **DATA_SOURCE**: `lowdb`（開発）| `firestore`（本番）
  - **LOWDB_PATH**: Lowdb 用 JSON を置くディレクトリ（例: `./data`）
  - **ADMIN_KEY** / **ADMIN_API_KEY**: 管理 API のクエリ key（?key=xxx）。ローカル用の任意文字列でよい。実装では `ADMIN_API_KEY` を参照。E2E で管理画面を通す場合は `ADMIN_API_KEY=test-admin-key` 等に設定し、テスト内で `?key=test-admin-key` を使用すること。
  - **NODE_ENV**: `development`

## 本番環境（Firebase）
- 本番の環境変数・シークレットは **人間が** **Firebase Console**（プロジェクトの設定 > 環境変数）または Cloud Functions の設定で行う。
- 設定すべきキー: **DATA_SOURCE**=firestore, **ADMIN_KEY**（管理画面用。**人間が値を決め、コンソールで設定**）。Firebase プロジェクト ID 等は SDK のデフォルトでよい。
- Firebase プロジェクトの新規作成・API 有効化・IAM 付与: **人間が** [Firebase Console](https://console.firebase.google.com/) および [Google Cloud Console](https://console.cloud.google.com/) で実施。Hosting / Firestore を有効化し、デプロイ用アカウントに Firebase Admin および Datastore User 等を付与。詳細は docs/02_manuals/02_デプロイマニュアル.md §4・§5 を参照。
- プロジェクト紐づけ: **人間が** `firebase use --add` でプロジェクト ID を選択。

## 環境変数一覧（参照用）

| 変数名 | 開発 | 本番 | 設定者 |
|--------|------|------|--------|
| DATA_SOURCE | lowdb | firestore | 開発: 人間（.env）。本番: 人間（Console） |
| LOWDB_PATH | ./data | （不要） | 人間（.env） |
| ADMIN_KEY | 任意文字列 | 本番用に人間が決定 | **人間**（.env / Console）。リポジトリに載せない。 |
| GOOGLE_APPLICATION_CREDENTIALS | シード実行時のみ | シード実行時のみ | **人間**（キー取得後、パスを設定）。 |

## Firebase デプロイ（初回）
1. **人間**: Firebase CLI で `firebase login`。`firebase use --add` でプロジェクト選択。
2. **人間**: 必要な API 有効化（Firestore, Hosting）。IAM 付与。本番 ADMIN_KEY を Console に設定。
3. Cursor/人間: `npm run build`。Next を静的 export する場合は next.config で output: 'export' を設定し、`out` を生成して `firebase deploy --only hosting`。
4. Next を Cloud Functions で動かす場合: 別途 Next.js 用 Firebase アダプタまたは Cloud Functions での Next サーバー起動を構成する（INFRA-01 参照）。
5. 本番シード投入: **人間が認証を用意したうえで**、`node scripts/seed-firestore.mjs` を実行（GOOGLE_APPLICATION_CREDENTIALS または Application Default Credentials）。投入先: Firestore の `workbooks`, `questions`。手順は docs/01_specs/06_operations/seed/README.md を参照。

## 人間が実施する作業 / Cursor が実施できる作業
- **人間**: プロジェクト作成、API 有効化、IAM 付与、本番シークレット設定、サービスアカウントキー取得・配置、firebase login / firebase use、デプロイの Go/No-Go。
- **Cursor（自動化）**: env.example 更新、シードデータ編集、シードスクリプト実行（認証済みなら）、ビルド、firebase deploy コマンド実行、ドキュメント更新。詳細は docs/02_manuals/02_デプロイマニュアル.md §3 を参照。

## 環境の区別
- 開発/本番で DATA_SOURCE を切り替え、接続先（Lowdb vs Firestore）を変更する。
- 本番への反映手順・ロールバック方針は、docs/99_history で管理する。
