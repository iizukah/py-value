# ワークスペース UI 修正とセル Run（Jupyter 相当）実装

- **日付**: 2025-02-08
- **参照プラン**: .cursor/plans/ワークスペースUIとセルRun仕様.md

## 変更内容

### 1. 左ペイン：採点結果と問題文の間にマージン

- `index.tsx`: 問題文ブロック（`workspace-problem-readability`）に `mt-4` を追加。

### 2. 右ペイン：VARIABLE WATCHER / RESULT PLOT

- **VARIABLE WATCHER**: プレースホルダーを英語に変更（「（セル Run または解答送信後に表示）」→ "Shown after cell Run or submit"）。
- **RESULT PLOT**: ヘッダー+ボディの 2 段をやめ、VARIABLE WATCHER と同じ 1 ブロックに統一。ラベルを「RESULT PLOT」に。背景・枠・ラベルスタイルを VARIABLE WATCHER に合わせた。「プロット」ラベルを削除し、画像なし時の説明を英語で表示（"Displayed after plt.show() runs"）。

### 3. セル Run：Jupyter 相当

- 各セルの Run で「そのセルのコードのみ」を実行。同一 Pyodide インスタンスで状態を共有。
- `lastRunCellIndexRef` で最後に実行したセル番号を保持。Run 時は未実行の上流セル（lastRunCellIndex+1 ～ N-1）を順に実行してから対象セル N を実行し、表示はセル N の出力のみ。以前のセルを再 Run した場合は 0 からそのセルまで再実行。
- セル数変更（追加・削除）時とリセット時に `lastRunCellIndexRef` を -1 にリセット。

## 対象ファイル

- `src/core/plugins/python-analysis/index.tsx`
