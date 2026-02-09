# py-value（EXER）プロジェクト総括・反省

**作成日**: 2026-02-09  
**対象プロジェクト**: py-value（EXER — 問題集プラットフォーム）  
**用途**: 本フェーズの総括と、今後の開発・引き継ぎのための教訓。03 プレフィクスで 80_summary に配置。

---

## 1. 目的

EXER（Python データ分析等をプラグインで拡張する問題集プラットフォーム）の、仕様整備・ワークスペース UI・Monaco 導入・本番デプロイ・UX 修正までのフェーズを総括し、良かった点・課題・教訓をまとめる。

---

## 2. プロジェクト概要

- **技術**: Next.js（App Router）, TypeScript, Pyodide（WASM）, Monaco Editor, Firebase（Hosting / Firestore）, Cloud Run
- **仕様の正本**: `docs/01_specs`。差分は `docs/01_specs/99_diff/` に統合。
- **変更履歴**: `docs/99_history/` に連番（0001～0048）で記録。Conventional Commits と ID 参照を運用。
- **役割**: AGENTS.md と `.cursor/skills/` で writer / architect / frontend-coder / reviewer 等を定義。DoD と環境分離をルール化。

---

## 3. 良かった点

- **99_history の連番とコンテキスト**: 4 桁連番＋「どの仕様 ID をなぜ変えたか」を書くルールで、後から経緯を追いやすかった。レビュー結果も同じ場所に記録。
- **仕様 ID のトレーサビリティ**: REQ / ARC / DD / FR-Fxxx / API-xxx 等を仕様・実装・コミットで参照し、変更の根拠をたどれた。
- **docs/.drafts の参照制限**: Writer 以外は .drafts を読まないルールで、実装が未確定ドラフトに依存することを防げた。
- **99_diff の 1 ファイル統合**: 仕様 vs 実装の差分を `01_2025-02-08.md` に集約し、99_diff の分散を解消した（0044）。
- **デプロイの自動化**: `scripts/deploy-production.mjs` で Cloud Build → Cloud Run → Firebase を一括実行。.env の ADMIN_KEY / GOOGLE_CLOUD_PROJECT を読み、再現可能な手順にした。
- **Monaco の非制御化**: セル入力時にカーソルが末尾に飛ぶ問題を、`value` 廃止・`defaultValue`＋`contentKey` による再マウントで解消（0048）。原因の切り分けと修正方針の記録を 99_history に残した。

---

## 4. 悪かった点・課題

- **本番 E2E のスキップ条件**: Pyodide ロードやワークスペース遷移の不安定さにより、本番では複数 E2E を `test.skip(isProd, ...)` でスキップしている（0047）。本番で通すための安定化または計測が未達。
- **npm 脆弱性**: npm audit で 9 件（eslint, next 等）。破壊的でない fix は別途検討のまま。本番ビルドは通っているが、依存の更新は継続課題。
- **PowerShell と git の日本語**: コミットメッセージやファイル名を UTF-8 で扱う際、シェルによっては文字化けする。`-F` でメッセージファイルを渡す・glob で add する等の回避が必要だった。
- **.cursor/rules の分散**: commits-and-history / specs-and-ux-sources / dod-and-environments 等、複数 mdc に分かれており、初見で一覧しづらい面がある。AGENTS.md が入口として機能しているが、ルールの一覧化は今後の改善余地。

---

## 5. 教訓・次回への提案

- **仕様変更は 99_history に必ず記録**: 日付・変更内容・関連ドキュメント ID を書く。「修正しました」ではなく「DD-022 の ○○ を、△△ のため変更した」レベルで残す。
- **制御/非制御の選択を明示**: Monaco のように 1 打鍵ごとに親 state が変わる UI では、制御コンポーネントだとカーソルがリセットされやすい。外部リセット時だけ key で再マウントする非制御パターンを検討する。
- **本番と開発の環境分離**: シークレット・接続先・機能フラグは環境ごとに分離し、.env.example と reference.md で運用方法を残す（DoD・インフラ SKILL と整合）。
- **デプロイ手順は 1 スクリプト化**: 人間の手順ミスを減らすため、認証済み前提で `node scripts/deploy-production.mjs` のように再現可能な形にしておく。
- **80_summary はフェーズごとに 0x_ で追加**: 01/02 に続き 03 でプロジェクト別総括を残すと、引き継ぎや振り返りに使える。

---

## 6. 参照

- [AGENTS.md](../AGENTS.md) — 役割一覧と docs/01_specs・docs/.drafts の扱い
- [docs/99_history/README.md](../99_history/README.md) — 99_history の書き方
- [docs/99_history/0044_99diff統合とテストデプロイドキュメント.md](../99_history/0044_99diff統合とテストデプロイドキュメント.md) — 統合・テスト・デプロイ整備
- [docs/99_history/0047_本番E2Eテスト実施とスキップ条件.md](../99_history/0047_本番E2Eテスト実施とスキップ条件.md) — 本番 E2E の条件
- [docs/99_history/0048_Monacoセル入力時カーソル飛び修正.md](../99_history/0048_Monacoセル入力時カーソル飛び修正.md) — Monaco UX 修正
- [docs/02_manuals/02_デプロイマニュアル.md](../02_manuals/02_デプロイマニュアル.md) — デプロイ手順
- [README.md](../../README.md) — プロジェクト概要・技術スタック・仕様書の場所
