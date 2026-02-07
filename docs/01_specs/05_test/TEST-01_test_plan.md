# TEST-01 テスト計画書（EXER 第一版）

## 1. ドキュメント情報

| 項目 | 内容 |
|------|------|
| **ID** | TEST-01 |
| **プロジェクト名** | EXER |
| **関連ドキュメント** | REQ-01, REQ-02, UX-01, API-01, DATA-01, DATA-02, ARC-01, ARC-02 |

本ドキュメントは、枠組みおよびデータ分析プラグインに対する**単体・結合・E2E テスト**の方針とテストケース ID、要件 ID との対応を定義する。TDD に従い、新規・変更時はテストを先行して記述し、実装はテストを満たすように行う。

---

## 2. テスト種別と方針

| 種別 | 対象 | ツール・手法 | 成果物の目安 |
|------|------|--------------|--------------|
| **単体** | ユーティリティ、判定ロジック、API ハンドラ、Repository の振る舞い | Jest / Vitest 等 | src/tests/unit/ |
| **結合** | 枠組み＋プラグイン連携、API と DB/モックの連携 | Jest / Vitest、MSW または実 DB モック | src/tests/integration/ |
| **E2E** | 画面遷移全パターン、主要ユースケースの端末操作 | Playwright | src/tests/e2e/ または e2e/ |

---

## 3. 単体テスト

### 3.1 枠組み

| テストケース ID | 対象 | 対応要件 ID | 概要 |
|-----------------|------|-------------|------|
| TC-001 | パンくず生成ユーティリティ | FR-F001 | URL パスから階層表示用の配列を正しく生成する。 |
| TC-002 | プラグインレジストリ | FR-F017, FR-F022 | registerPlugin / getPlugin で type に応じたコンポーネント・判定アダプタが取得できる。 |
| TC-003 | QuestionService（一覧・ソート・タグ） | FR-F003, FR-F025, FR-F026, FR-F028 | 登録順・難易度・タイトル・お気に入り数ソート、tags フィルターが正しく適用される。 |
| TC-004 | QuestionService（0 件時） | FR-F003 | 0 件時に空配列とメッセージ用の扱いができる。 |
| TC-005 | DraftService / DraftRepository | FR-F005, FR-F021 | 下書きの取得・保存（1 問題 1 件上書き）が正しく動作する。 |
| TC-006 | HistoryService / HistoryRepository | FR-F008, FR-F021 | 履歴の保存・一覧取得・詳細取得、ワークブック単位の件数上限が守られる。 |
| TC-007 | FavoriteService / FavoriteRepository | FR-F027 | 追加で count+1、解除で count-1、0 で削除。一覧は clientId で絞れる。 |
| TC-008 | 解答送信フロー（枠組み側） | FR-F006, FR-F007, FR-F019 | submit 時にプラグインの runJudge を呼び出し、JudgeResult を履歴保存・レスポンス返却する。 |
| TC-009 | ワークブック一覧・取得 | FR-F024 | WorkbookRepository から一覧・1 件取得が正しく動作する。 |
| TC-010 | 管理系 API キー検証 | FR-F011 | key 未指定・不正時に 401 等を返す。 |
| TC-011 | 問題 CRUD（管理） | FR-F011, FR-F012 | 問題の作成・取得・更新・削除、status の切り替えがリポジトリで正しく動作する。 |
| TC-012 | インポート・バリデーション | FR-F014 | 1 件でもバリデーションエラーがあれば全体拒否となる。 |
| TC-013 | エクスポート | FR-F014 | 全問題を 1 配列で返す。データセットは参照のみ。 |
| TC-014 | API Route Handler（問題一覧） | API-003, FR-F003 | GET /api/workbooks/:id/questions が sort, tags を正しく扱い、favoriteCount を含む。 |
| TC-015 | API Route Handler（解答送信） | API-009, FR-F006 | POST submit で userAnswer を渡し、JudgeResult を返す。X-Client-Id 必須。 |

### 3.2 プラグイン（データ分析）

| テストケース ID | 対象 | 対応要件 ID | 概要 |
|-----------------|------|-------------|------|
| TC-P01 | runJudge（値一致） | FR-P008 | expected_value + tolerance で isCorrect が true/false になる。 |
| TC-P02 | runJudge（タイムアウト） | FR-P006, FR-P011 | 60 秒超でタイムアウト種別の JudgeResult を返す。 |
| TC-P03 | runJudge（実行エラー） | FR-P011 | 例外時に実行エラー種別の JudgeResult を返す。 |
| TC-P04 | セル結合 | FR-P001 | 複数セルのコードを結合して 1 スクリプトとして実行する。 |
| TC-P05 | 変数監視の値取得 | FR-P004 | watchVariables で指定した変数の値を取得できる。 |
| TC-P06 | Matplotlib 相関（r > 0.99） | FR-P009 | Axes から数値配列を抽出し期待値と相関を判定する。 |
| TC-P07 | 初期コード空 → 1 セル | FR-P007 | initial_code が空のとき空の 1 セルとして扱う。 |

### 3.3 単体テスト 要件 ID ↔ テストケース ID 対応表

| 要件 ID | テストケース ID |
|---------|-----------------|
| FR-F001 | TC-001 |
| FR-F003 | TC-003, TC-004, TC-014 |
| FR-F005 | TC-005 |
| FR-F006, FR-F007, FR-F019 | TC-008, TC-015 |
| FR-F008 | TC-006 |
| FR-F011 | TC-010, TC-011 |
| FR-F014 | TC-012, TC-013 |
| FR-F017, FR-F022 | TC-002 |
| FR-F024 | TC-009 |
| FR-F025, FR-F026, FR-F028 | TC-003, TC-014 |
| FR-F027 | TC-007 |
| FR-F021 | TC-005, TC-006, TC-008 |
| FR-P001 | TC-P04 |
| FR-P004 | TC-P05 |
| FR-P006, FR-P011 | TC-P02, TC-P03 |
| FR-P007 | TC-P07 |
| FR-P008 | TC-P01 |
| FR-P009 | TC-P06 |

---

## 4. 結合テスト

### 4.1 枠組み＋プラグイン連携

| テストケース ID | 対応要件 ID | 概要 |
|-----------------|-------------|------|
| TC-INT-01 | FR-F002, FR-F006, UC-F02, UC-F05 | 問題取得 → プラグイン Renderer 表示 → 解答送信 → 採点結果表示まで一連のフロー。モックまたは実 WASM で runJudge を実行。 |
| TC-INT-02 | FR-F005, FR-F021 | 下書き保存 → 再表示で下書きが復元される。 |
| TC-INT-03 | FR-F008 | 解答送信後に履歴一覧・詳細に記録が現れる。 |
| TC-INT-04 | FR-F027, API-018～020 | お気に入り追加・解除 → 一覧取得で反映される。 |
| TC-INT-05 | FR-F003, FR-F026 | 問題一覧取得で tags フィルターを付与すると該当問題のみ返る。 |
| TC-INT-06 | FR-F007, NFR-F002 | Web Worker 経由で runJudge が呼ばれ、結果がクライアントに返る。 |

### 4.2 API と DB/モックの連携

| テストケース ID | 対応 | 概要 |
|-----------------|------|------|
| TC-INT-10 | API-001, API-002, DATA-01 | GET workbooks が Lowdb/Firestore モックから正しく返る。 |
| TC-INT-11 | API-003, API-004, DATA-01 | GET questions が sort, tags, favoriteCount を反映する。 |
| TC-INT-12 | API-009, DATA-02 | POST submit で JudgeResult が DATA-02 の型と一致して返る。 |
| TC-INT-13 | API-005, API-006 | 履歴一覧・詳細が X-Client-Id で絞られて返る。 |

### 4.3 結合テスト 要件 ID ↔ テストケース ID 対応表

| 要件 ID | テストケース ID |
|---------|-----------------|
| FR-F002, FR-F006, UC-F02, UC-F05 | TC-INT-01 |
| FR-F003, FR-F026 | TC-INT-05 |
| FR-F005, FR-F021 | TC-INT-02 |
| FR-F007, NFR-F002 | TC-INT-06 |
| FR-F008 | TC-INT-03 |
| FR-F027 | TC-INT-04 |
| API-001, API-002 | TC-INT-10 |
| API-003, API-004 | TC-INT-11 |
| API-005, API-006 | TC-INT-13 |
| API-009 | TC-INT-12 |

---

## 5. E2E テスト（Playwright）

### 5.1 画面遷移とユースケース対応

| テストケース ID | 対応 UC / 画面 | 概要 |
|-----------------|----------------|------|
| TC-E2E-01 | UC-F10, SC-000 | ルート `/` でホームが表示され、ファーストビュー・問題集カードが表示される。 |
| TC-E2E-02 | UC-F10, SC-000 → SC-001 | 問題集（例: Data Analysis）を選択すると問題一覧（SC-001）に遷移する。 |
| TC-E2E-03 | UC-F01, SC-001 | 問題一覧でソート・タグフィルターが動作し、カードから問題を選択できる。 |
| TC-E2E-04 | UC-F02, SC-001 → SC-002 | 問題を選択するとワークスペース（SC-002）に遷移する。 |
| TC-E2E-05 | UC-F05, SC-002 → SC-003 | 解答送信後、採点結果（SC-003）が表示される（ローディング後バッジ・Retry/一覧へ戻る）。 |
| TC-E2E-06 | UC-F09, SC-003 → SC-004 | 全問正解で完了画面（SC-004）に遷移する。 |
| TC-E2E-07 | SC-003 → SC-001 | 「一覧へ戻る」で問題一覧に戻る。 |
| TC-E2E-08 | UC-F06, SC-001 → SC-005 → SC-006 | ヘッダから履歴へ遷移し、履歴一覧・詳細を表示できる。 |
| TC-E2E-09 | UC-F12, SC-001 → SC-011 | ヘッダからお気に入りへ遷移し、お気に入り一覧を表示できる。 |
| TC-E2E-10 | UC-F12, SC-011 → SC-002 | お気に入り一覧から問題に挑戦できる。 |
| TC-E2E-11 | UC-F07, SC-007 → SC-008 | 管理（?key=xxx）でダッシュボード → 問題登録エディタに遷移できる。 |
| TC-E2E-12 | UC-F08, SC-007 → SC-009, SC-010 | インポート/エクスポート・データセットアップロードへの導線が動作する。 |
| TC-E2E-13 | NFR-F004 | キーボードのみで主要操作（問題選択、送信、一覧へ戻る等）が実行できる。 |

### 5.2 E2E 要件 ID ↔ テストケース ID 対応表

| 要件 ID / UC | テストケース ID |
|--------------|-----------------|
| UC-F10 | TC-E2E-01, TC-E2E-02 |
| UC-F01 | TC-E2E-03 |
| UC-F02 | TC-E2E-04 |
| UC-F05 | TC-E2E-05 |
| UC-F09 | TC-E2E-06 |
| UC-F06 | TC-E2E-08 |
| UC-F12 | TC-E2E-09, TC-E2E-10 |
| UC-F07 | TC-E2E-11 |
| UC-F08 | TC-E2E-12 |
| NFR-F004 | TC-E2E-13 |

---

## 6. 実施方針

- **優先順位**: 初回デプロイ時の「最低限動作する」範囲では、単体の TC-001～TC-015 および TC-P01～TC-P07、結合の TC-INT-01, TC-INT-02, TC-INT-03, TC-INT-10, TC-INT-11, TC-INT-12、E2E の TC-E2E-01～TC-E2E-07 を必須とする。
- **ダミー許容**: 管理・お気に入り・履歴・ソート・タグは初回はダミー実装でもよいが、結合・E2E で導線と画面遷移はテストする。
- **環境**: 単体・結合は CI で実行。E2E は Playwright でヘッドレス実行。環境変数・シークレットは 06_operations に従う。

---

## 7. 参照

- REQ-01 機能要件・非機能要件・ユースケース
- REQ-02 FR-P001～FR-P011, UC-P01～UC-P08
- UX-01 画面 ID（SC-000～SC-011）
- API-01, DATA-01, DATA-02
- 06_operations 環境・デプロイ（テスト実行環境）
