# シードデータ（06_operations）

## 概要

初回デプロイ・開発環境用のシードデータの配置と投入方法は [../INFRA-01_operations_and_deploy.md](../INFRA-01_operations_and_deploy.md) §7 を参照する。

## 用意するデータ

- **ワークブック**: 1 件（例: id `py-value`, title 「Pythonデータ分析」）。DATA-01 の Workbook 型に準拠。
- **問題**: 5 問。DATA-01 の QuestionBase と DATA-02 の python-analysis 拡張に準拠。CSV なしで解ける問題とする。

## スキーマ参照

- ワークブック・問題の共通基底: [../../03_contracts/DATA-01_shared_types_and_schemas.md](../../03_contracts/DATA-01_shared_types_and_schemas.md)
- データ分析プラグイン用拡張: [../../03_contracts/plugins/DATA-02_plugin_python_analysis.md](../../03_contracts/plugins/DATA-02_plugin_python_analysis.md)

## 投入方法

- **開発（Lowdb）**: リポジトリの `data/workbooks.json`, `data/questions.json` をそのまま利用する。`LOWDB_PATH=./data` で参照される。
- **本番（Firestore）**: Admin SDK を用いたシードスクリプト `scripts/seed-firestore.mjs` を実行する。
  - 前提: Firebase プロジェクトを用意し、`GOOGLE_APPLICATION_CREDENTIALS` にサービスアカウント JSON のパスを設定するか、`firebase login` 済みで `firebase use` でプロジェクトを選択する。
  - 実行: `node scripts/seed-firestore.mjs`
  - 投入先: Firestore の `workbooks`, `questions` コレクション。

シードデータの実体はリポジトリの `data/workbooks.json`, `data/questions.json` に配置している。
