# 0026 本番トラブル修正（Favorite/History Firestore、ソート・タグ、管理画面遷移）

## 日付

2026-02-08

## 概要

本番環境（https://exir-27624.web.app）で発生していたお気に入り 500・採点 500・履歴未反映・ソート未対応・タグ未対応・管理画面保存後遷移しない事象を修正した。

## 変更内容

- **Firestore FavoriteRepository**（API-019/020, DATA-01 §3.4）: `src/core/repositories/firestore/favorite-repository.ts` を新規作成。コレクション `favorites`、docId は `workbookId_questionId_clientId`。get/add/remove/listByWorkbookAndClient/countByQuestion を実装。
- **Firestore HistoryRepository**（API-005/006, DATA-01 §3.5）: `src/core/repositories/firestore/history-repository.ts` を新規作成。コレクション `histories`。save/listByWorkbookAndClient（createdAt 降順）/getById/enforceLimit を実装。`firestore.indexes.json` に histories の複合インデックス（workbookId, clientId, createdAt DESC）を追加。
- **repositories/index.ts**: `getFavoriteRepository()` と `getHistoryRepository()` で `DATA_SOURCE === "firestore"` のとき Firestore 実装を返すように切り替え。本番でお気に入り・採点（履歴保存）が Firestore を参照するようになった。
- **Firestore QuestionRepository**（API-003, FR-F025/026）: `listByWorkbookId` で `options.tags` によるフィルタ（メモリ上）と `options.sort` の order/difficulty/title を実装。favorites ソートは `question-service.ts` で favoriteCount 付与後にソートするよう追加。
- **管理画面**（SC-008）: `QuestionEditorClient.tsx` で保存成功時、新規・編集を問わず `window.location.href = backUrl` で管理画面へ遷移するよう変更。

## 関連ドキュメント

- API-003, API-005/006, API-019/020, DATA-01, FR-F025/026, SC-008, INFRA-01
