# 0040 pyvalue5 参照・コピペ HTML 混入の分析と修正

## 日付

2025-02-08

## pyvalue5.html の実装（参考）

- **ハイライトのソース**: 常に **textarea の value（プレーンテキスト）** のみを使用。
- **反映方法**: `highlightCode.textContent = code` で **textContent に代入** → その後 `Prism.highlightElement(highlightCode)` で Prism が DOM を書き換える。
- **重要**: ハイライト用要素には **innerHTML で「保存されていた文字列」を入れていない**。必ず textarea の現在値（文字列）を textContent でセットし、ライブラリがその文字列から HTML を生成している。そのため、保存データに HTML が混ざっていても、ハイライト層には「文字列としてのコード」だけが渡る。

## 当アプリとの違い

- 当アプリは `value`（= cell.content）を `stripHtmlToPlainText` で正規化した `plainValue` を `highlightPython(plainValue)` に渡し、その **返り値の HTML** を pre に `dangerouslySetInnerHTML` で表示している。
- 問題になっていたのは **strip の順序**。保存データに `&lt;` / `&gt;` のように **実体参照** が含まれていると、**デコード前に** タグ除去の正規表現（`<[^>]+>` や `"py-xxx">`）をかけてもマッチせず、除去されない。その結果、`plainValue` に HTML 断片が残り、`highlightPython` の出力にも混入して pre に表示されていた。

## 実施した修正

- **stripHtmlToPlainText**: **先に decodeHtmlEntities を実行**し、そのあとでタグ・断片の除去を行うように変更。これで `&gt;` が `>` に直った状態で正規表現がかかるため、`"py-string">` や `class="py-string">` などが除去される。

## ユーザーが調査・操作すべきこと

### 1. 既に HTML が混ざったセル（既存データ）の確認

- **現象**: いま表示しているセルの **中身（cell.content）** が、過去のコピペで HTML 混入したまま **保存・ドラフト復元** されている可能性がある。
- **操作**:
  - 該当セルを **全選択して削除** し、**もう一度プレーンテキストだけを貼り付け** する。
  - または **リセット（Retry 付近のリセット）** で初期コードに戻し、必要なら改めてコードを入力／貼り付けする。
- **確認**: 上記のあと、pre に `class="py-string">` 等が表示されなくなっているか確認する。

### 2. 貼り付けが「自前の onPaste」を通っているか

- **調査**: 開発者ツールのコンソールで、貼り付け時に `handlePaste` が呼ばれているか確認する。
- **操作**: `CodeInputWithHighlight.tsx` の `handlePaste` の先頭に一時的に  
  `console.log("paste", e.clipboardData.getData("text/plain")?.slice(0, 80));`  
  を追加し、セルに貼り付けしてログが出るか見る。
- **ログが出ない場合**: ブラウザやフォーカスによっては `paste` が別経路で処理されている可能性がある。その場合は「1」のとおり、セル内容をいったん消してからプレーンテキストだけ貼り直すと、state が正規化された内容で上書きされる。

### 3. 保存・ドラフトの内容

- **調査**: ドラフト保存後に、**API やストレージに保存されているセル内容** に HTML が含まれていないか確認する（開発者ツールの Network で draft 保存の request body、またはデータファイルを直接見る）。
- **意味**: 修正後は「表示時・保存前に strip」がかかるため、新規に貼り付けた内容はプレーンテキストで保存される想定。既存のドラフトにだけ HTML が残っている場合は、「1」の操作で上書きすれば解消する。

### 4. コピー元

- **推奨**: 可能な限り **プレーンテキストのコピー元**（メモ帳、VS Code の「選択をコピー」、ターミナルなど）からコピーする。
- **注意**: ブラウザの「レンダリング済みコードブロック」や、当アプリの **ハイライト表示中のセル** をそのままコピーすると、環境によっては `text/html` や `text/plain` に HTML が含まれる場合がある。その場合でも、今回の strip（decode 先行）と paste 時の正規化で、挿入・表示はプレーンテキストになる想定。

## 関連

- docs/.drafts/pyvalue5.html（syncEditor: textContent = input.value → Prism）
- decode-html-entities.ts（stripHtmlToPlainText の decode 先行に変更）
- 0039 コピペ HTML 混入 調査箇所
