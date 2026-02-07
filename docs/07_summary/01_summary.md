# プロジェクト・ナレッジ総括：次世代エージェントへの引き継ぎ書

**作成日**: 2026-02-01  
**対象プロジェクト**: SnapMark  
**用途**: 次回別のプロジェクトを開始する際、AI エージェントに「前回の教訓」として読み込ませるためのドキュメント。

---

## A. 設計図の運用（Specs & .cursorrules）

### 良かった点

- 「唯一の正は spec/」「docs/reports/ に 3 桁連番で報告」など、正本と報告先を明示したことで、実装の追跡と diff 管理が可能になった。
- 「1 回 1 コマンド」「TDD 禁止なし」「NG-01 仕様にない機能追加禁止」などが、勝手な結合コマンドや仕様外コードの抑制に効いた。
- ID の埋め込み（ED-ARC, RQ-xx）により、変更と仕様の対応関係を後からたどれた。
- 報告書に「実施内容」「関連する仕様 ID」「変更箇所の Diff」「日付」を書かせたことで、Stalled 後やスレッド切替後も復旧しやすかった。

### 悪かった点・誤解が生じた箇所

- .cursorrules のパスが `docs/spec/`・`docs/shared/src/` のままになっており、実際の `00_docs/01_specs/`・`shared/src/` と不一致。AI が古いパスを参照して誤解した（03_diff_01 の DIFF-04 に記録）。
- ルールが複数あり「報告先」「spec の正本」「型の正本」が分散し、初見のエージェントが一覧で把握しづらい可能性があった。
- **教訓**: .cursorrules のパスを実ディレクトリと合わせなかったため、型の場所を AI が誤参照した。これは失敗だった。次は移行時に .cursorrules を必ず更新しろ。

### 教訓：次回 .cursorrules に含めるべき必須ガードレール

- 仕様・型・報告先のパスは、リポジトリ内の実際のディレクトリと完全一致させる。プレフィックス（00_docs/ 等）も省略しない。
- コマンドは 1 回 1 つ。`&&` / `||` による結合は禁止。
- 仕様にない機能を追加しない（NG-01）。追加する場合は先に仕様を更新し、diff に記録する。
- テストのない実装は禁止。TDD: 失敗テスト → 実装 → リファクタ → 通過確認。
- 上記を「そのままコピペできる短文」で .cursorrules に書く。プロンプトとして使える形にする。

---

## B. ディレクトリ構造の最適化

### 最終構造（ツリー）

```
SnapMark/
├── backend/           # Node + Express + TS。Firestore は Repository 経由。
├── frontend/          # React (Vite) + TS。Auth のみ Firebase SDK。
├── shared/            # 型定義（Note 等）。
├── 00_docs/
│   ├── 01_specs/      # 要件・仕様・仕様差分（01_requreiments, 02_specifications, 03_diff_01）
│   ├── 02_manuals/    # 統合マニュアル（01_manual）
│   ├── 05_reports/    # レポート要約（00_report）
│   ├── 06_context/    # プロジェクトコンテキスト・AI 向け要約（00_context）
│   ├── 07_summary/    # ナレッジ総括・引き継ぎ書（本ファイル）
│   └── 99_archive/    # アーカイブ（diff, reports, manuals, spec, samples, images, plans）
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── .firebaserc
├── .gitignore
└── README.md
```

### 評価：有効だった分割・不便だった点

- **有効だった点**: 番号付き（01_specs, 02_manuals, 05_reports, 06_context）で「正本」「マニュアル」「要約」「コンテキスト」の役割が一目で分かる。99_archive で過去の reports/diff を残したことで、要約ファイル（00_report, 03_diff_01）だけでは分からない経緯を参照できた。
- **不便だった点**: 当初の `docs/spec` と整理後の `00_docs/01_specs` の二重表記が残り、.cursorrules や diff 内のパス表記が混在した。
- **教訓**: 正本のパスは 1 つに固定し、移行時は一括置換と .cursorrules 更新をセットで行う。

---

## C. Firebase & 環境戦略

### 指示の出し方のコツ

- 「Auth はエミュレータ／本番のどちらに繋ぐか」を指示に含める。開発時は「フロントは VITE_USE_AUTH_EMULATOR、バックエンドは FIREBASE_AUTH_EMULATOR_HOST または USE_AUTH_EMULATOR を設定し、エミュレータ利用時は projectId を 'demo-no-project' にする」と一文で書くと誤解が減る（報告 060 の 401 原因＝aud 不一致）。
- Firestore は「開発時は FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 を backend に設定」と明示する。
- Hosting / Cloud Run の初回デプロイは「バックエンドを先にデプロイし、得た Service URL を VITE_API_BASE_URL に設定してからフロントをビルドする」と順序を書く。

### 環境分離（開発 Emulator / 本番）と .env の扱い

- `.env` / `.env.production` / サービスアカウント JSON はリポジトリに含めない。.gitignore で除外し、「環境変数一覧」はマニュアルに表で載せる。
- 本番用 Firebase 設定（apiKey 等）と VITE_API_BASE_URL はビルド時に埋め込まれるため、「.env.production を編集したら必ず再ビルド・再デプロイする」と注意を書く。
- 開発時は VITE_USE_AUTH_EMULATOR !== "false" でエミュレータ接続（報告 015）。バックエンドは FIREBASE_AUTH_EMULATOR_HOST または USE_AUTH_EMULATOR=true でエミュレータ指定。エミュレータ利用時は projectId を "demo-no-project" に（報告 060）。

---

## D. プロセス管理（Reports & Context）

### reports の価値（Stalled 後の復旧等）

- 作業完了・進捗ごとに 3 桁連番で報告書を書かせたことで、Stalled やスレッド切替後も「最後に何をしたか」「どの仕様 ID と対応しているか」を 00_report や 99_archive/reports から復元できた。
- バグ修正（008, 015, 031, 060 等）を報告書に残したことで、同じ事象の再発時に「報告 060 と同様に aud を合わせる」のように参照できた。
- 報告書には「実施内容」「関連する仕様 ID」「変更箇所の Diff（日付込み）」「日付」を必ず含めさせる。

### コンテキスト圧縮と「まとめファイル」の重要性

- 長いチャットを捨て、定期的に「00_report（レポート要約）」「03_diff_01（仕様と実装の差分）」「00_context（AI 向け最短要約）」を作成したことで、新スレッドや別エージェントが短いファイルだけ読んで再開できるようにした。
- まとめファイルは、作成日を明記し、参照元（例: 99_archive/reports）を書く。
- 次回も「区切りごとにまとめファイルを作成し、新スレッドでは 00_context と 03_diff_01 を読んで続きから」とルール化する。

---

## E. 技術スタック特有の指示

### React / TypeScript / Node

- **型**: 共有型は 1 箇所（例: shared/src/note.ts）に集約し、「Note の正はここ」と .cursorrules と 06_context の両方に書く。バックエンドの req.params.id は `string | string[]` になることがあるため、「string に正規化し、未定義・配列時は 400 を返す」と指示するとよい（報告 008）。
- **非同期**: 楽観的更新と 409 時ロールバックを仕様で明示する。さらに「送信時に最新 state を ref で参照し、同一リソースの PATCH を直列化する」と実装レベルまで書くと 409 多発を防げた（報告 031）。
- **VITE_API_BASE_URL**: フロントのビルド時に埋め込まれる。本番では .env.production に設定し、バックエンドの Service URL を先に確定させる。

### デザイン（CSS）の言語化

- グラスモーフィズム・余白・ロゴサイズなどは、「数値と変数名」をセットで書くと再現しやすい。例:「付箋は --glass-bg + backdrop-filter: blur(60px)。ロゴは幅 240px。余白は space-y-12, mb-14。」
- 「デザインの正本は frontend/src/index.css と 02_manuals/01_manual のスタイル章とする。samples は参考用」と 1 行で書いておくと、index.html と実装の二重定義を防げる（03_diff_01 の DIFF-06）。

---

## F. プロジェクト進行の順序（Planning）

### 前後関係の教訓（バックエンド vs フロントエンド）

- フロントのビルドには VITE_API_BASE_URL（バックエンドの URL）が必須。バックエンドを後回しにすると、本番ビルドができないか、誤った URL が埋め込まれる。
- 初回デプロイで「Step 2 でバックエンドを Cloud Run にデプロイ → Service URL をメモ → Step 3 で .env.production にその URL を設定してからフロントをビルド・Hosting デプロイ」と順序を守ったことで、一度で本番が動いた。

### 推奨フロー：バックエンド先出し等

- デプロイ計画では「1) Firebase プロジェクト作成・有効化 → 2) バックエンドビルド・デプロイ・Service URL 確定 → 3) フロント .env.production に URL 設定 → 4) フロントビルド・Hosting デプロイ」と明文化する。
- 「バックエンド先出し」を Plan のチェックリストに含め、AI に順序を守らせる。

---

## G. トラブルシューティング & 汎用チップス

### Connection stalled 対策

- **原因**: 巨大なコンテキスト（長いチャット・多数ファイル）で応答が止まる。
- **回避策**: スレッドを分割し、区切りごとに「ここまでの実施内容を 00_report または報告書に要約する」と依頼する。Cycle Count やコンテキスト上限を意識し、定期的に「まとめファイル」を作成してから新スレッドで「00_context と 03_diff_01 を読んで続きから」と指示する。

### AI への問いかけ（独断防止のプロンプト）

- 仕様にない挙動を追加する前に、仕様を更新するか diff に「許容して仕様で明記」として記録するか、どちらにするか確認せよ。
- 複数案がある場合は A 案・B 案を列挙し、推奨と理由を述べたうえで選ばせよ。
- 上記を次回プロジェクトで AI に読み込ませるプロンプトとして、付録にコピペ用で載せる。

---

## 付録：コピペ用プロンプト集

### 次回 .cursorrules に含めるべきガードレール（短文）

```
- 仕様・型・報告先のパスは、リポジトリ内の実際のディレクトリと完全一致させる。プレフィックスも省略しない。
- コマンドは 1 回 1 つ。&& / || による結合は禁止。
- 仕様にない機能を追加しない。追加する場合は先に仕様を更新し、diff に記録する。
- テストのない実装は禁止。TDD: 失敗テスト → 実装 → リファクタ → 通過確認。
```

### Stalled 後の復旧手順

```
1. 最後の報告書（00_report または 99_archive/reports の最新）を開く。
2. 「実施内容」「関連する仕様 ID」を確認する。
3. 新スレッドで「00_context と 03_diff_01 を読んだうえで、報告書 XXX の続きから実施せよ」と指示する。
4. 必要なら「ここまでの実施内容を 00_report に追記せよ」と依頼する。
```

### デプロイ順序のチェックリスト

```
- [ ] Step 1: Firebase プロジェクト作成・Auth / Firestore / Hosting 有効化・API キー等メモ
- [ ] 事前準備: Firebase CLI インストール・firebase login・firebase use --add・必要なら firebase init hosting（public: frontend/dist）
- [ ] Step 2: バックエンドビルド・デプロイ・Service URL 確定 → メモ
- [ ] Step 3: frontend/.env.production に Step 1 の Firebase 値と Step 2 の Service URL（VITE_API_BASE_URL）を設定
- [ ] Step 4: フロントビルド・Hosting デプロイ・動作確認
```

### 独断防止のプロンプト（AI に読み込ませる用）

```
- 仕様にない挙動を追加する前に、必ず「仕様を更新するか、diff に『許容して仕様で明記』として記録するか」のいずれかを選び、ユーザーに確認せよ。独断で追加しないこと。
- 複数案（A 案・B 案）がある場合は、推奨と理由を述べたうえで選ばせること。こちらで決めつけないこと。
```
