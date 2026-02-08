# 0008 Web デザイン変更一覧（変更管理 ID: CD-001～CD-029）

## 日付

2026-02-08

## 目的

- **正本**: docs/01_specs/04_ui_ux/reference/mock.html を正とする。現行実装を mock に準拠した Web デザインに変更する。
- **変更管理 ID**: CD-001 ～ CD-029。未修正個所の特定・実装トレースに利用する。
- **参照**: 0007_実装とmock差分_デザイン.md を変更項目の根拠とする。アプリ形態は現行（Next.js）優先。採点結果はワークスペース内表示のまま、見た目を mock に合わせる。

---

## 変更一覧

| ID | 項目（概要） | 対象画面/コンポーネント | mock 該当箇所 | 現行との差分 | 実装メモ |
|----|--------------|-------------------------|---------------|--------------|----------|
| CD-001 | ヘッダ: sticky + glass + z-index | Header.tsx | .app-header: position sticky, top 0, z-index 100; background var(--glass-bg); backdrop-filter blur(12px) | 現行は sticky なし、背景は color-bg-secondary | use sticky, glass-bg, backdrop-filter |
| CD-002 | ヘッダ: ロゴを SVG に | Header.tsx | SVG path+circle+text "EXER", .logo-glow, .font-logo | テキスト "EXER" のみ | mock の SVG を React で同様に描画 |
| CD-003 | ヘッダ: ナビをアイコン＋ボタン風 | Header.tsx | .nav a: border-radius 999px, padding, Lucide list/heart/history/settings | テキストのみの Link | Lucide React でアイコン追加、スタイルを pill に |
| CD-004 | パンくず: 全画面共通化 | 新規 Breadcrumb コンポーネント | .breadcrumb, .breadcrumb-sep, .breadcrumb-workbook-link, Lucide chevron-right/home | 問題ページのみインライン表示 | layout または各 page で使用、ホーム時は非表示 |
| CD-005 | ホーム: 背景レイヤー | ホーム用背景コンポーネント | #home-bg-layer, fvGridMove, fv-shape, fvFloat, fv-light-sweep, fvSweep | なし | body.home-bg-visible で表示。layout または page で class 制御 |
| CD-006 | ホーム: ヒーロー文言・グラデーション | page.tsx (ホーム) | .first-view-hero, .text-gradient-emerald, .text-gradient-blue "Mind"/"Skill" | h1 EXER + p のみ、グラデーションなし | h1 を hero に、Mind/Skill に span+gradient |
| CD-007 | ホーム: ワークブックカード | page.tsx (ホーム) | .workbook-cards, .workbook-card, .workbook-card-disabled, glass, hover | GET STARTED のみ、カードなし | Pythonデータ分析カード＋Coming Soon 無効カード追加 |
| CD-008 | ホーム: GET STARTED スタイル | page.tsx (ホーム) | .btn-get-started: padding 14px 32px, font-size 1.125rem | 既存 Link、スタイルやや小 | .btn-get-started 相当のクラス適用 |
| CD-009 | 問題一覧: ソートをボタン風＋アイコン | QuestionListClient.tsx | #list-sort .btn, btn-secondary/btn-ghost, data-sort, Lucide arrow-down-up/signal/type/heart | Link 群、アイコンなし | ボタンまたは Link をボタン風に、Lucide 追加 |
| CD-010 | 問題一覧: タグを tag-pill | QuestionListClient.tsx | .tag-filter-row .tag-pill, .active | Link、aria-pressed | クラス tag-pill, active、スタイル一致 |
| CD-011 | 問題一覧: タイル構造 header | QuestionListClient QuestionCard | .question-tile .tile-header, .tile-subtitle "CHALLENGE xx", .tile-title-row, .tile-difficulty, .tile-display-title | タイトル+Badge+タグの行 | tile-header 内に subtitle（order から生成）, title-row, difficulty, display-title |
| CD-012 | 問題一覧: tile-body＋円形バッジ | 同上 | .tile-body, .tile-body-left (tile-tags, tile-excerpt), .tile-body-right .badge 90px | 抜粋なし、バッジはラベル風 | body-left に tags+excerpt、body-right に 90px 円形バッジ |
| CD-013 | 問題一覧: バッジ円形＋Lucide | 同上 | .badge .badge-pass/fail/none, award/x-circle/circle-dashed, 90px 円 | テキスト「合格」「不合格」「未挑戦」 | 円形＋Lucide アイコンに変更 |
| CD-014 | 問題一覧: お気に入りブロック | 同上 | .btn-favorite-block, アイコン＋tile-favorite-count | ♥/♡＋数、小さい | ブロックスタイル、Lucide heart |
| CD-015 | 問題一覧: Try ボタン・リンクボタン化 | 同上 | .tile-footer .btn.btn-primary "Try" | タイトルが Link | フッターに Try ボタン（.btn .btn-primary）、リンクはボタン風に |
| CD-016 | ワークスペース: 3-pane プラグイン内 | python-analysis/index.tsx | .three-pane grid 25% 1fr 30%, .pane, .workspace-problem-pane, .cell-group-ws, .workspace-variable-watcher | 1 カラム、縦積み | プラグイン内で左=問題、中央=エディタ、右=変数・プロット。900px で 1fr |
| CD-017 | ワークスペース: ツールバー | 同上 | .workspace-toolbar, 下書き保存・解答送信、アイコン | 実行・採点のみ | ツールバー＋下書き保存・解答送信をアイコン付きボタンに |
| CD-018 | ワークスペース: 採点結果クラス | 同上 | .workspace-judge-success, .workspace-judge-fail | ブロック表示、クラス名なし | クラス名 workspace-judge-success/fail 付与 |
| CD-019 | 採点結果: メダル・バッジ・タイル | 同上 | .result-medal-wrap, .result-status-badge 112px, .result-status-label, .result-tile, resultTileAppear | コンパクトなバッジ＋ボタン | 112px 円バッジ、result-tile 風、アニメ |
| CD-020 | 採点結果: 採点中ローディング | 同上 | .result-grading-loading, スピナー＋「採点中」 | 文言のみ or なし | result-grading-loading スタイルでスピナー＋テキスト |
| CD-021 | 完了画面: center-block, card, 文言 | complete/page.tsx | .center-block, .card, 「おめでとうございます。全問正解です。」、一覧へ戻るボタン＋アイコン | お疲れさまです、カードなし | 文言変更、card、center-block、ボタン＋アイコン |
| CD-022 | 履歴一覧: history-table, バッジ 44px | HistoryListClient.tsx | .history-table, .badge 44px, .btn-history-back-wrap, 一覧へ戻るボタン＋アイコン | テーブル/リスト、バッジ小 | history-table クラス、バッジ 44px、ボタン＋アイコン |
| CD-023 | 履歴詳細: クラス・ReTry ボタン | HistoryDetailClient.tsx | .history-detail-tile, .history-detail-problem, .history-detail-user-answer-body, ReTry ボタン＋アイコン | 構造類似、ReTry はリンク/ボタン | クラス名統一、ReTry をボタン＋アイコンに |
| CD-024 | お気に入り: タイル同様・一覧へ戻る | FavoritesListClient.tsx | #favorites-tiles question-tiles 同様, 一覧へ戻るボタン＋アイコン | 一覧表示、戻るあり | タイルを SC-001 と同構造、ボタン＋アイコン |
| CD-025 | 管理画面: input 等 WCAG コントラスト | QuestionEditorClient 等 | 他ページとトーン統一。input/select/textarea 背景・文字色 | 白系統で見づらい | var(--color-bg-main), var(--color-text), border で見やすく |
| CD-026 | 管理画面: form-group, btn | 同上 | .form-group, .btn スタイル | 現行スタイル | mock の .form-group, .btn に合わせる |
| CD-027 | ローディング: 共通 overlay | 新規 LoadingOverlay | #loading-overlay, .stats-loader, .stats-bar, .scanning-line, .loading-text | 各所で個別 or なし | 共通コンポーネント、state/context で表示制御 |
| CD-028 | フッター: fixed, NODE_ENV 削除 | Footer.tsx | .app-footer position fixed, .footer-status, .online。NODE_ENV は**削除** | 通常フロー、NODE_ENV 表記あり | fixed、footer-status、.online に。NODE_ENV 文言削除 |
| CD-029 | リンク全般: ボタン風＋アイコン | 各画面 | テキストリンクを角丸・padding＋アイコン | 一部テキストリンクのまま | 上記以外の「一覧へ戻る」「編集」「詳細」等をボタン風＋アイコンに |

---

## mock クラス名・対象ファイル早見

- **CD-001～003**: app-header, logo-link, logo, nav → Header.tsx
- **CD-004**: breadcrumb, breadcrumb-sep, breadcrumb-workbook-link → 新規 Breadcrumb
- **CD-005**: home-bg-layer, fv-shape, fv-light-sweep → 新規 HomeBgLayer 等
- **CD-006～008**: first-view-hero, text-gradient-*, workbook-cards, btn-get-started → page.tsx
- **CD-009～015**: list-sort, tag-pill, question-tile, tile-header, tile-body, badge, btn-favorite-block → QuestionListClient.tsx
- **CD-016～020**: three-pane, workspace-toolbar, workspace-judge-*, result-* → python-analysis/index.tsx
- **CD-021**: center-block, card → complete/page.tsx
- **CD-022～023**: history-table, history-detail-* → HistoryListClient, HistoryDetailClient
- **CD-024**: favorites-tiles → FavoritesListClient.tsx
- **CD-025～026**: form-group, btn → QuestionEditorClient 等
- **CD-027**: loading-overlay, stats-loader, scanning-line → 新規 LoadingOverlay
- **CD-028**: app-footer, footer-status, .online → Footer.tsx
- **CD-029**: 各画面の残りリンク

---

## 関連

- 0007_実装とmock差分_デザイン.md
- docs/01_specs/04_ui_ux/reference/mock.html
- .cursor/rules/specs-and-ux-sources.mdc（HIG / Material / WCAG）
