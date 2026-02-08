# EXER（問題集プラットフォーム）

## 概要

EXER は、学習コンテンツとシステム基盤を分離した**拡張可能な問題集プラットフォーム**です。Python データ分析、SQL、統計学など、プラグイン方式でさまざまな問題集を追加できます。

- **プロジェクト名**: EXER
- **目的**: 1 URL = 1 ワークブック。プラグインで問題形式（コード実行・採点など）を拡張する。

## 技術スタック

- **フロントエンド**: Next.js（App Router）, TypeScript, Tailwind CSS
- **実行環境**: Pyodide（Python / WebAssembly）、Monaco Editor（コード編集）
- **本番**: Firebase（Hosting, Firestore）、Cloud Run
- **開発**: Lowdb（JSON）、リポジトリパターンでデータソースを抽象化

## ディレクトリ構成

```
src/
  app/           # Next.js App Router（ページ・API ルート）
  core/          # 枠組みの中核（services, repositories, plugins）
  lib/           # 共有ユーティリティ・型
  tests/         # 単体・結合・E2E テスト
docs/
  01_specs/      # 確定仕様書（要件・アーキテクチャ・契約・UI/UX・テスト・運用）
  02_manuals/    # 環境構築・デプロイ・プラグイン追加・Cursor プロンプト例
  99_history/    # 変更履歴・報告書
```

## 開発の始め方

1. **リポジトリをクローン**
   ```bash
   git clone <リポジトリURL>
   cd py-value
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数**
   - `.env.example` を参照し、必要な場合は `.env` を用意する（リポジトリにコミットしない）。

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   - ブラウザで http://localhost:3000 を開く。

## テスト

- **単体・結合**: `npm run test`（Vitest）
- **E2E**: `npm run test:e2e`（Playwright。開発サーバーは自動起動）
- **本番 E2E**: `npm run test:e2e:prod`（要・本番 URL の設定）

## デプロイ

本番デプロイの手順は **docs/02_manuals/02_デプロイマニュアル.md** および **docs/01_specs/06_operations/INFRA-01_operations_and_deploy.md** を参照してください。Cloud Run へのコンテナデプロイと Firebase Hosting のデプロイを行います。

## 仕様書・マニュアル

- **仕様の正本**: `docs/01_specs/`（REQ-01, REQ-02, ARC-01, ARC-02, API-01, DATA-01, DATA-02, UX-01～04, TEST-01, INFRA-01）
- **仕様と実装の差分**: `docs/01_specs/99_diff/`（統合ファイル 01_YYYY-MM-DD.md）
- **マニュアル**: `docs/02_manuals/`（環境構築、デプロイ、プラグイン追加、Cursor プロンプト例）
- **変更履歴**: `docs/99_history/`（連番で記録）

## 貢献・トレーサビリティ

- 仕様書・設計書には ID（REQ-01, FR-F001, DD-xxx 等）を付与しています。実装やコミットでは対応する ID を参照してください。
- 変更時は `docs/99_history` に報告し、Conventional Commits に従ってコミットします。日本語メッセージの場合は `-F` で UTF-8 ファイルを指定してください（.cursor/rules 参照）。
