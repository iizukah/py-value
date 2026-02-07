# 0002 02_architecture と 03_contracts 仕様書の追加

## 日付

2026-02-07

## 変更内容

- **docs/.drafts** に骨子を追加した。
  - ARC-01_outline.md, DATA-01_outline.md, API-01_outline.md, ARC-02_outline.md, DATA-02_outline.md を作成。本編確定後は骨子を削除する運用（残す場合は本 history に記録）。
- **02_architecture/** に ARC-01_system_design.md を追加した。
  - ARC-01-001 レイヤー構成（App / Service / Repository）、ARC-01-002 ディレクトリ構造（src/ 以下、Next.js App Router 整合）、ARC-01-003 プラグインレジストリ・配置方針、ARC-01-004 データフロー、ARC-01-005 環境別データソース切り替え（Lowdb / Firestore）。Mermaid でレイヤー・データフローを記載。プラグイン詳細は ARC-02 参照。
- **02_architecture/plugins/** を新設し、ARC-02_plugin_python_analysis.md を追加した。
  - データ分析プラグインのディレクトリ構成（src/core/plugins/python-analysis/）、ファイル名規則（index.tsx, judge.ts）、コンポーネント・データフローを Mermaid で図示。
- **03_contracts/** に DATA-01_shared_types_and_schemas.md、API-01_rest_contract.md、openapi.yaml を追加した。
  - DATA-01: 共有型（QuestionBase, Workbook, History, Draft）、Firestore スキーマ（workbooks, questions フラット, histories, drafts）、Lowdb 互換、履歴上限のワークブック単位表現。プラグイン用は DATA-02 に委ねる。
  - API-01: 契約のみ定義。X-Client-Id ヘッダで匿名識別子を送る旨を共通仕様に明記。管理系はクエリ key を検証する。エンドポイント一覧（API-001〜API-017）は openapi.yaml が正本で API-01 は説明として参照。
  - openapi.yaml: API-01 に対応する OpenAPI 3.x 定義（1 ファイル）。パス・メソッド・スキーマ・X-Client-Id・key 検証を機械可読で定義。
- **03_contracts/plugins/** を新設し、DATA-02_plugin_python_analysis.md、API-02_rest_contract.md を追加した。
  - DATA-02: データ分析プラグイン用の問題 JSON スキーマ（problem_statement, initial_code, validation, dataset, watchVariables）、JudgeResult 等の型、仮想 FS・Pyodide 周りのデータ形式。REQ-02 §6 の確定。
  - API-02: 将来プラグインがサーバー API を持つ場合用。MVP ではエンドポイントなし。将来は openapi_plugins.yaml 追加または openapi.yaml にパス追加とする方針を記載。
- **docs/01_specs/README.md** を更新した。
  - ディレクトリ構成に 02_architecture/plugins/、03_contracts/plugins/ を追記。命名規則に ARC-02, DATA-02, API-02 の配置先を追記。

## 関連ドキュメント ID

- REQ-01, REQ-02
- ARC-01, ARC-02
- DATA-01, DATA-02
- API-01, API-02
- openapi.yaml

## 備考

- プラン「02_architecture と 03_contracts 仕様書作成プラン」の実施手順に従い、骨子 → ARC-01 → DATA-01 → API-01 ＋ openapi.yaml → ARC-02 → DATA-02 → API-02 の順で作成した。
- questions はフラットなコレクションで workbookId で絞る方針。匿名識別子は X-Client-Id ヘッダで送る。
- 本編を 01_specs に確定したため、docs/.drafts の骨子（ARC-01_outline.md, DATA-01_outline.md, API-01_outline.md, ARC-02_outline.md, DATA-02_outline.md）は削除した。
