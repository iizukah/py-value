# 0022 Firestore ルールにトップレベルコレクションを追加

## 日付

2025-02-07

## 概要

本番で Firestore を使用する際、アプリが参照するトップレベルコレクション（questions, histories, drafts, favorites）をルールで許可した。実装はトップレベル `questions` を使用しており、既存ルールには workbooks と workbooks/{id}/questions（サブコレクション）のみだった。

## 変更内容

- firestore.rules に以下を追加:
  - `match /questions/{questionId}` → read: true, write: false
  - `match /histories/{historyId}` → read: true, write: false
  - `match /drafts/{draftId}` → read: true, write: false
  - `match /favorites/{favoriteId}` → read: true, write: false
- サーバーは Admin SDK でルールをバイパスするため、クライアント直アクセス抑止として write: false を統一。

## 関連ドキュメント

- INFRA-01（運用・デプロイ）
- docs/02_manuals/02_デプロイマニュアル.md
