# INFRA-01 運用・デプロイ・環境（EXER 第一版）

## 1. ドキュメント情報

| 項目 | 内容 |
|------|------|
| **ID** | INFRA-01 |
| **プロジェクト名** | EXER |
| **関連ドキュメント** | REQ-01, ARC-01, DATA-01, API-01, TEST-01 |

本ドキュメントは開発環境・本番環境の構成、デプロイ方針、環境変数・シークレット、ビルド・起動コマンド、シードデータの配置・投入方法を定義する。

---

## 2. デプロイ・環境の方針

- **環境設計**: 開発環境と本番環境は **仕様全部を想定して最初から用意する**。MVP 用の一時構成にはせず、全機能を見据えた構成とする。
- **初回デプロイ**: **まずは**最低限動作するデプロイを行い、動作確認ができたら、仕様をすべて仕上げていく。
- **環境分離**: 設定・シークレット・接続先・機能フラグは環境ごとに分離し、本番向けの破壊的変更や誤操作を防ぐ。環境変数・シークレットの管理方法は本ドキュメント §6 およびプロジェクト内 **reference.md**（インフラ SKILL に従い infra-engineer が整備）に記載する。

---

## 3. 「最低限動作する」条件（初回デプロイの目標）

以下の条件を満たす範囲で初回デプロイを行う。

| 項目 | 内容 |
|------|------|
| サンプル問題 | 5 問を用意する。 |
| 採点 | **ダミーではなく WebAssembly（Pyodide 等）**で採点し、結果が表示される。 |
| 画面遷移 | **全パターン**をユーザがテストできる（ホーム→一覧→ワークスペース→採点結果→一覧／次の問題、お気に入り・履歴・管理への導線）。 |
| 管理・お気に入り・履歴・ソート・タグ | **ダミーでよい**（モックまたは簡易実装）。 |
| UI | **簡素**。後で UX を詰める前提でよい。 |
| データセット | **CSV は用意しない**。CSV なしで解ける問題（NumPy / matplotlib / pandas の load 等で完結する問題）を 5 問用意する。 |
| その他 | 必要最低限の機能のみ実装し、後から追加する前提でコードの複雑化を避ける。 |

---

## 4. 開発環境

### 4.1 構成

- **実行場所**: ローカル（開発者マシン）
- **データソース**: Lowdb（JSON ファイル）。ARC-01-005 に従い、Repository の Lowdb 実装で `workbooks.json`, `questions.json`, `histories.json`, `drafts.json`, `favorites.json` を利用する。
- **フロント**: Next.js 開発サーバ（`next dev`）

### 4.2 環境変数・シークレット

| 変数名（例） | 説明 | 開発時の例 |
|--------------|------|------------|
| `DATA_SOURCE` | データソース種別（`lowdb` \| `firestore`） | `lowdb` |
| `LOWDB_PATH` | Lowdb の JSON ファイルを置くディレクトリ | `./data` または `./.local` |
| `ADMIN_KEY` | 管理 API のクエリ key（?key=xxx） | ローカル用の任意文字列（.env に記載、リポジトリにコミットしない） |
| `NODE_ENV` | `development` | `development` |

- **.env.example**: 上記のキーと説明を記載したテンプレートをルートまたは `docs/01_specs/06_operations/` に配置する。実際の値は .env に記載し、.env は .gitignore する。

### 4.3 ビルド・起動コマンド

| 操作 | コマンド（例） |
|------|----------------|
| 依存インストール | `npm ci` または `npm install` |
| 開発サーバ起動 | `npm run dev`（Next.js の `next dev`） |
| 本番ビルド | `npm run build` |
| 本番モード起動（ローカル） | `npm run start` |

- シードデータ投入後、開発サーバ起動で `http://localhost:3000` 等にアクセスする。

---

## 5. 本番環境

### 5.1 構成

- **実行場所**: Firebase Hosting + Cloud Functions、または Vercel / Cloud Run 等。プロジェクト方針に応じて選択する。
- **データソース**: Firebase Firestore（DATA-01 のスキーマに従う）。Storage はデータセット（CSV）用（MVP では未使用可）。
- **認証**: MVP では匿名利用。簡易キーによる管理画面のアクセス制御のみ。

### 5.2 環境変数・シークレット

| 変数名（例） | 説明 | 本番 |
|--------------|------|------|
| `DATA_SOURCE` | `firestore` | `firestore` |
| `ADMIN_KEY` | 管理 API の key | Firebase Console / シークレット管理で設定。コードにハードコードしない。 |
| Firebase 設定 | プロジェクト ID 等 | 環境変数または Firebase SDK のデフォルト（Hosting と同一プロジェクト時） |

- 本番のシークレットは **Firebase Console** または利用プラットフォームのシークレット管理で設定する。reference.md に「本番は Firebase Console 等で設定」と明記する。

### 5.3 ビルド・デプロイ

| 操作 | コマンド・手順（例） |
|------|----------------------|
| ビルド | `npm run build` |
| デプロイ | `firebase deploy` または `vercel --prod` 等。プロジェクトの CI/CD に合わせる。 |

- 初回デプロイ時は、Firestore のコレクション（workbooks, questions 等）が存在する必要がある。シードデータの投入方法は §7 を参照。

---

## 6. 環境変数・シークレットの管理（reference.md との関係）

- **開発**: .env に `DATA_SOURCE=lowdb`, `LOWDB_PATH`, `ADMIN_KEY` 等を記載。.env.example にキー名と説明のみを残す。
- **本番**: プラットフォームのシークレット機能（Firebase Console、Vercel Environment Variables、Cloud Run の Secret Manager 等）で設定する。**reference.md**（infra-engineer が整備）に、どこに何を設定するかを記載する。
- **.env**: リポジトリにコミットしない。.gitignore に含める。

---

## 7. シードデータ

### 7.1 用意するデータ

| 種別 | 内容 | 用途 |
|------|------|------|
| ワークブック | 1 件（例: id `py-value`, title 「Pythonデータ分析」） | ホームで選択可能にする。 |
| 問題 | 5 問（type: `python-analysis`） | 一覧・ワークスペース・採点の動作確認。CSV 不要で解ける内容（NumPy / 簡単な計算等）。 |

### 7.2 配置先と投入方法

| 環境 | 配置先 | 投入方法 |
|------|--------|----------|
| 開発 | `data/workbooks.json`, `data/questions.json` 等（Lowdb 用） | リポジトリにサンプル JSON をコミットするか、`scripts/seed-lowdb.ts` 等で初回実行時に投入。 |
| 本番 | Firestore の `workbooks`, `questions` コレクション | Firebase Console から手動投入、または Admin SDK を使ったシードスクリプトを実行。 |

- **シードデータのスキーマ**: DATA-01（Workbook, QuestionBase）および DATA-02（python-analysis 拡張）に準拠する。サンプル問題 5 問分の JSON 例は `docs/01_specs/06_operations/seed/` に配置することを推奨する（別ファイルで定義してもよい）。

### 7.3 サンプル問題の条件

- **validation**: method `value_match` 等で、変数 `ans` を検証する程度の簡単な問題。
- **initial_code**: 空または簡単なコード。
- **dataset**: 参照しない（CSV なしで解ける問題）。

---

## 8. 参照

- REQ-01 環境分離（開発/本番）
- ARC-01-005 環境別データソース切り替え
- DATA-01 Firestore / Lowdb スキーマ
- TEST-01 テスト計画（実行環境）
- プロジェクト内 reference.md（環境変数・シークレットの詳細）
