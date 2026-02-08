# Monaco Editor 導入（Python セル）

- **日付**: 2025-02-08
- **内容**: Python 分析プラグインのセル入力に Monaco Editor を導入。従来の textarea はオーバーレイ時の HTML 混入不具合があったため、Monaco に差し替え。
- **関連**: DD-022, python-analysis プラグイン

## 変更概要

1. **依存**: `@monaco-editor/react` を追加（^4.6.0）
2. **MonacoCodeCell.tsx**: 新規。Monaco Editor をラップし、`value` / `onChange` で親と同期。言語は `python`、テーマは `vs-dark`。表示前の HTML 正規化（toPlain）を継続。
3. **CodeInputWithHighlight.tsx**: `next/dynamic` で `MonacoCodeCell` を `ssr: false` で読み込み。同一 props のまま差し替え。読み込み中は「読み込み中…」を表示。
4. **index.tsx**: 変更なし（従来どおり `CodeInputWithHighlight` を利用）。

## 備考

- セル UI の Run / 追加 / 削除は従来どおり。Monaco は編集領域のみ。
