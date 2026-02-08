# Python セル入力：HTML 混入対策・Monaco 導入・セル高さ自動調整 報告書

- **日付**: 2025-02-08
- **対象**: DD-022（Python 分析プラグイン・セル入力）
- **関連 99_history**: 0039, 0040, 0041

---

## 1. 経緯と問題

### 1.1 現象

- テキストエリアにコードをコピペした際、**プレーンテキストではなく** `class="py-string">` や `class="py-comment">` などの文字列が表示される。
- コピペをせず **「#」を入力しただけ**で、`"comment">#` と表示される。
- 数値コード（`data-ps="0"`）に変更しても、`"0">` や `"1">` が混入する。
- これらは「表示されているだけ」で編集・削除が難しい状態になる場合があった。

### 1.2 原因の整理

- セル入力は **textarea の背後に pre を重ねるオーバーレイ方式**で、pre にシンタックスハイライト用 HTML（`<span class="py-comment">` 等）を `innerHTML` で表示していた。
- 何らかの経路（ブラウザのアクセシビリティやフォーム周りの挙動など）で、**背後にある pre の HTML の一部がテキストエリアの value に混入**していた。
- そのため、ストリップで除去しても、**入力のたびに再度混入**する根本原因は解消されなかった。

---

## 2. 実施した対策

### 2.1 残骸除去の強化（decode-html-entities.ts）

- `stripHtmlToPlainText` 内で、以下を除去する正規表現を追加・調整した。
  - `class=class="py-string""py-comment">` 等のパターン
  - `data-ps="comment">` / `"comment">` / `"0">` ～ `"3">` 等
  - ASCII および Unicode 引用符（`"` `"` 等）に対応
- 既存の value やドラフトに残った残骸を読み込み時に除去する目的。

### 2.2 オーバーレイ方式の廃止（根本対策）

- **pre を textarea の背後に置くのをやめ**、セル入力は **textarea のみ**表示するように変更。
- これにより「pre の HTML が value に混入する」経路を断った。
- シンタックスハイライトは一旦なしに（オーバーレイ廃止の代償）。

### 2.3 Monaco Editor の導入

- セル入力を **Monaco Editor**（`@monaco-editor/react`）に差し替え。
- **同一 props**（`value` / `onChange` / `placeholder` / `aria-label` / `className` / `style` / `rows`）を維持し、既存の `CodeInputWithHighlight` の呼び出しは変更不要とした。
- 実装概要:
  - **MonacoCodeCell.tsx**: 新規。Monaco をラップし、言語 `python`、テーマ `vs-dark`。表示前に `decode-html-entities` で正規化。
  - **CodeInputWithHighlight.tsx**: `next/dynamic` で `MonacoCodeCell` を `ssr: false` で読み込み。ローディング中は「読み込み中…」を表示。
- シンタックスハイライトは Monaco 側で提供され、**オーバーレイを使わない**ため混入問題は再発しない設計とした。

### 2.4 セル高さの自動調整

- **テキストエリア時代**: `scrollHeight` を利用し、入力・コピペに合わせて textarea の高さを `useLayoutEffect` で更新。ラッパーを `h-full` から「内容で伸びる」形に変更し、セルボックスも連動して伸びるようにした。
- **Monaco 導入後**: `editor.getContentHeight()` と `onDidChangeModelContent` により、入力内容に応じて高さを state で更新。外部から value が変わったとき（初期表示・貼り付け等）も `displayValue` の `useEffect` で高さを再計算するようにした。
- 最小高さは 72px を維持。

---

## 3. 変更・追加ファイル一覧

| ファイル | 内容 |
|----------|------|
| `decode-html-entities.ts` | 新規。HTML 実体デコード・タグ・class/data-ps 残骸の除去。 |
| `CodeInputWithHighlight.tsx` | textarea 単体 → Monaco の dynamic 読み込みに変更。 |
| `MonacoCodeCell.tsx` | 新規。Monaco Editor ラップ、value/onChange、高さ自動調整。 |
| `python-highlight.ts` | class → data-ps 数値化を経て、オーバーレイ廃止後は未使用。 |
| `package.json` | `@monaco-editor/react` 追加。 |
| `docs/99_history/0039` | コピペ HTML 混入の調査箇所。 |
| `docs/99_history/0040` | pyvalue5 参照・コピペ HTML 分析と修正。 |
| `docs/99_history/0041` | Monaco Editor 導入（Python セル）。 |
| `docs/99_history/0042` | 本報告書。 |

---

## 4. 結果と今後の注意

- **結果**: セル入力は Monaco に統一され、`"comment">` 等の混入は発生しない想定。セル高さも入力量に応じて自動調整される。
- **注意**: 今後セル入力に「背後に pre を重ねる」オーバーレイを再度導入する場合は、同様の混入が起こり得るため、採用時は十分な検証が必要。
