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

- **開発（Lowdb）**: `data/workbooks.json`, `data/questions.json` 等に JSON を配置するか、スクリプトで投入。
- **本番（Firestore）**: Firebase Console または Admin SDK を用いたシードスクリプトで `workbooks`, `questions` に投入。

具体的な JSON 例は実装時に `scripts/` または本ディレクトリに配置してよい。
