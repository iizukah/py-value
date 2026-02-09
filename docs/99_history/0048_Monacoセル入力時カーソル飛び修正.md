# Monaco セル入力時カーソル飛び修正

- **日付**: 2025-02-08
- **関連**: DD-022（Python セル Monaco）、UX

## 事象

セル入力時に打鍵のたびにカーソルが最終行末尾へ移動する。

## 原因

Monaco を完全制御（`value` で親 state と同期）していたため、打鍵 → `onChange` → 親の `setCells` → 再レンダー → `value={cell.content}` で Editor に再代入 → モデルが上書きされカーソルがリセットされていた。

## 対応

1. **MonacoCodeCell.tsx**
   - 非制御化: `value` の代わりに `defaultValue` のみ渡し、入力中は親から `value` で上書きしない。
   - 外部から内容を差し替えるとき（下書き読み込み・Retry）は `contentKey` を変えて Editor を再マウントし、そのときの `defaultValue` を反映。

2. **index.tsx**
   - `cellsRevision` state を追加。`initialAnswer` の useEffect および `handleReset` でインクリメント。
   - `CodeInputWithHighlight` に `contentKey={cellsRevision}` を渡し、リビジョン変更時にセルを再マウント。

## 変更ファイル

- `src/core/plugins/python-analysis/MonacoCodeCell.tsx`
- `src/core/plugins/python-analysis/index.tsx`
