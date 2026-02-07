# 0008 99_diff 0005 追加・.cursor 設定・99_history 必須報告

## 日付

2026-02-07

## 変更概要

### 1. 99_diff 0005（レビュー指摘の修正差分）
- **docs/01_specs/99_diff/0005_レビュー指摘_修正差分.md** を新規作成。
- レビュー指摘を修正差分として整理：REQ-01/DATA-01（お気に入り矛盾解消・MVP モデル B 明記）、API-01（動詞 URI のリソース指向案・管理 API の MVP 補足）、UX-01/UX-02/wireframes（0001・0004 反映・合格/不合格・Passed/Fail 統一・SC-003 今後の改善）、ARC-01/TEST-01（NFR-P001 具体化・MVP は導線確認に留める）。実施は別途。

### 2. .cursor 設定
- **コミットメッセージの文字化け防止**: `.cursor/rules/commits-and-history.mdc` を強化。日本語メッセージは `-m` 禁止、**UTF-8 ファイル + `git commit -F`** を必須化。リポジトリ推奨の git config（core.quotepath, i18n.commitEncoding, i18n.logOutputEncoding）を追記。
- **PowerShell**: `.cursor/rules/terminal-powershell.mdc` を新設。**`&&` は使わない**。コマンド連結は **`;`** を使う。日本語パス・git add の注意を記載。
- **参照用**: `.cursor/README.md` を追加。上記運用と git config のまとめ。

### 3. 99_history 必須報告のルール化
- **commits-and-history.mdc** の 99_history 節に「**編集時は必ず報告する**」を追加。仕様書・設計・運用ドキュメント・プロジェクト設定（.cursor 等）を編集したときは必ず 99_history に記録し、コミット前に確認することと明記。

## 関連ドキュメント

- docs/01_specs/99_diff/0005_レビュー指摘_修正差分.md
- .cursor/rules/commits-and-history.mdc, .cursor/rules/terminal-powershell.mdc, .cursor/README.md
