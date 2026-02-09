# ワークスペース UI 修正とセル Run 仕様（Jupyter 相当）

## 概要

1. 左ペイン：採点結果と問題文の間にマージン追加  
2. 右ペイン：Result Plot を VARIABLE WATCHER とフォーマット統一（RESULT PLOT 表記・プロット削除・プレースホルダー英語）  
3. 右ペイン：VARIABLE WATCHER のプレースホルダーも英語で表示  
4. セル Run：Jupyter 同様「そのセルのみ実行しつつ前セルの状態を共有」

---

## 確認済み回答（プラン反映）

| # | 項目 | 回答 |
|---|------|------|
| 1 | RESULT PLOT のプレースホルダー（画像なし時） | 英語で表示（例: "Displayed after plt.show() runs"） |
| 2 | VARIABLE WATCHER のプレースホルダー | 英語で表示（例: "Shown after cell Run or submit"） |
| 3 | セル編集後の Run の動き | Jupyter 同様：押したセルだけ実行。上流セルを編集しても自動では再実行しない。 |

---

## 1. 左ペイン：採点結果と問題文の間にマージン

**対象**: [src/core/plugins/python-analysis/index.tsx](src/core/plugins/python-analysis/index.tsx)

- 問題文ブロック（`workspace-problem-readability`）に上マージン（例: `mt-4`）を追加する。

---

## 2. 右ペイン：Result Plot を VARIABLE WATCHER に合わせる

**対象**: 同上（右ペイン 710–765 行付近）

- **レイアウト・スタイル**: ヘッダー+ボディの2段をやめ、VARIABLE WATCHER と同じ1ブロックにする。  
  - コンテナ: `rounded-[var(--radius-md)] border p-3`、`background: "rgba(1, 4, 9, 0.9)"`、`borderColor: "var(--color-border)"`
- **ラベル**: 「RESULT PLOT」と表示。スタイルは VARIABLE WATCHER のラベルに合わせる（`text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]`）。
- **「プロット」の削除**: 未表示時の `<span className="label ...">プロット</span>` を削除。
- **プレースホルダー**: 画像がないときの説明は**英語**で表示（例: "Displayed after plt.show() runs"）。

---

## 3. 右ペイン：VARIABLE WATCHER のプレースホルダーを英語に

**対象**: 同上（Variable Watcher ブロック内）

- 現状の「（セル Run または解答送信後に表示）」を**英語**に変更（例: "Shown after cell Run or submit"）。

---

## 4. セル Run：Jupyter 相当（そのセルのみ実行・状態共有）

**方針**: 各セルの Run は「そのセルのコードだけ」を実行する。Pyodide のグローバルをセッション内で保持し、前のセルで定義した変数・関数は共有される。上流セルを編集した場合は、そのセルをユーザーが Run するまで再実行しない（Jupyter 同様）。

**変更箇所**:
- [judge.ts](src/core/plugins/python-analysis/judge.ts): 同一 Pyodide インスタンスで「渡されたコードだけ」を実行する API、または既存 `runCodeAndGetVariables` を「追加実行」として使えるようにする。
- [index.tsx](src/core/plugins/python-analysis/index.tsx): `handleRunCell(cellIndex)` で、セル cellIndex のコードだけを実行。未実行の上流セル（0～cellIndex-1）がある場合は、同じ Pyodide で 0 から順に実行してから cellIndex を実行し、表示は cellIndex の出力のみ。

---

## 5. 実装順序

1. 左ペインマージン  
2. 右ペイン（VARIABLE WATCHER プレースホルダー英語 + RESULT PLOT 統一・英語・プロット削除）  
3. セル Run の Jupyter 相当化  

変更後、docs/99_history に記録する。
