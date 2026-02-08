# 0036 ワークスペース改善（ローディング・セル・採点結果・Markdown）

## 日付

2025-02-08

## 概要

ワークスペース改善プランに従い、ローディング表示・セル入力・採点結果ラベル・スクロールバー・問題文 Markdown/数式表示を実装した。

## 変更内容

1. **ローディング中にコード入力ペインを見せない**
   - Pyodide 準備中は 3-pane を描画せずオーバーレイのみ表示（`pyodideReady` が true になってから three-pane を表示）。
   - 採点中・セル実行中のオーバーレイに `opacity: 1` を明示し、背面のコードが見えないようにした。

2. **セル背景と入力文字のコントラスト・ペースト時の HTML 実体**
   - セル（cell-box）と CodeInputWithHighlight の背景を `var(--color-bg-secondary)` に変更し、文字色との差を明確にした。
   - `CodeInputWithHighlight.tsx` の `handlePaste` で、`getData("text/plain")` 取得後に HTML 実体デコード（`decodeHtmlEntities`）を適用。`&#39;` → `'`、`&quot;` → `"` 等。

3. **採点結果時のラベル**
   - 中央ペインの見出しを「問題一覧」から「次の問題に挑戦！」に変更。

4. **コードペインのスクロールバー**
   - 中央ペインに `workspace-code-pane` クラスを付与。`globals.css` に `.workspace-code-pane` 用のスクロールバースタイル（DD-043 と同トーン）を追加。

5. **ローディングの垂直揃え**
   - Pyodide 準備中・採点中/実行中・共通 LoadingOverlay の 3 箇所で、アニメーションと文言を `flex flex-col items-center justify-center gap-2` のラッパーで囲み、縦並びのままブロック全体を中央寄せにした。

6. **問題文の Markdown・数式表示**
   - `react-markdown`, `remark-math`, `rehype-katex`, `rehype-raw`, `rehype-sanitize`, `katex` を追加。
   - 新規コンポーネント `ProblemStatementMarkdown`（GFM、`$...$` / `$$...$$` の数式、rehype-raw で HTML 許可、rehype-sanitize で XSS 対策）。
   - ワークスペース左ペインの問題文を当該コンポーネントで表示。

7. **その他**
   - `QuestionListClient.tsx` の `SORT_ICONS` 型を `size?: number | string` に修正（ビルドエラー解消）。

## 変更ファイル

- `src/core/plugins/python-analysis/index.tsx` — Pyodide 時のみ 3-pane 表示、中央ペイン workspace-code-pane、ラベル「次の問題に挑戦！」、採点/実行中オーバーレイ不透明・縦揃え、セル背景 bg-secondary、ProblemStatementMarkdown 使用
- `src/core/plugins/python-analysis/CodeInputWithHighlight.tsx` — decodeHtmlEntities、handlePaste でデコード適用
- `src/core/plugins/python-analysis/ProblemStatementMarkdown.tsx` — 新規（Markdown + 数式 + HTML サニタイズ）
- `src/app/globals.css` — .workspace-code-pane スクロールバー
- `src/app/components/layout/LoadingOverlay.tsx` — 縦揃え用ラッパー
- `src/app/[workbookId]/QuestionListClient.tsx` — SORT_ICONS 型修正
- `package.json` — react-markdown, remark-math, rehype-katex, rehype-raw, rehype-sanitize, katex 追加

## 関連ドキュメント

- .cursor/plans/ワークスペース改善プラン.md
- CD-016～020, DD-021, DD-022, DD-023, DD-043
