# 役割一覧とプロジェクト構成（EXER）

**プロジェクト名**: EXER。仕様書は第一版として docs/01_specs に配置する。

## 確定仕様の置き場所
- **docs/01_specs**: 確定した仕様書・設計書を配置する。アーキテクト・実装・レビューはここを参照する。
- **docs/.drafts**: ドラフト用。参照・編集してよいのは Writer 役割のタスク時のみ。それ以外の役割は参照しない。

## ソースコードと設定
- **ソースコード**: すべて **src/** 以下に配置する。ルートには設定ファイル（package.json, next.config, tsconfig.json, firebase.json 等）のみ。
- **テストコード**: src 直下（例: src/tests/）。
- src 内のサブ構造は必要に応じて決める（例: src/app, src/server, src/packages）。プラグインは後から変更可能な仕様とする。

## 役割（SKILL）一覧
| 役割 | スキル名 | 概要 |
|------|----------|------|
| ライター | writer | 仕様書・要件定義を作成。docs/.drafts を参照可。確定依頼時に docs/01_specs に確定版を作成。 |
| Webデザイナー | web-designer | UI/UX を HIG/Material/WCAG に沿って設計。 |
| アーキテクト | architect | docs/01_specs に基づき全体計画を立て、適切な SKILL を明示的に指示。プランは Markdown で残す。 |
| バックエンドコーダ | backend-coder | バックエンド実装。リポジトリパターン・DB抽象化。 |
| フロントエンドコーダ | frontend-coder | フロントエンド実装（Next.js App Router, TypeScript, WASM）。 |
| レビューア | reviewer | 直近のコミットを監査。レビュー結果は docs/99_history に記録。 |
| デバッガ | debugger | デバッグ・テストと最小限の修正。 |
| インフラエンジニア | infra-engineer | 開発/本番環境。環境変数・シークレットは reference.md に記載。 |

各 SKILL の詳細は .cursor/skills/{skill-name}/SKILL.md を参照する。
