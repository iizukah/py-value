# 0029: Web デザイン mock 準拠変更（CD-001～CD-029）

- **日付**: 2025-02-07
- **目的**: docs/01_specs/04_ui_ux/reference/mock.html を正本とし、実装を mock に合わせる。
- **参照**: docs/01_specs/99_diff/0008_Webデザイン変更一覧_CD.md、.cursor/plans/webデザインmock準拠変更_1bce67fd.plan.md

## 実施内容

### Phase 5 残り（本セッション）
- **CD-023**: 履歴詳細（HistoryDetailClient）に history-detail-tile、history-detail-user-answer-body を適用。ReTry をボタン＋アイコン（RotateCcw）。一覧へ戻るを ArrowLeft＋btn-secondary。
- **CD-024**: お気に入り一覧（FavoritesListClient）をタイル表示（SC-001 と同様）、一覧へ戻るをボタン＋アイコンに変更。

### Phase 4（ワークスペース・採点結果）
- **CD-016**: python-analysis プラグイン内で 3-pane レイアウト（左=問題、中央=セル編集、右=Variable Watcher＋Plot）。grid 25% 1fr 30%、900px 以下で 1fr。workspace-problem-pane、cell-group-ws、cell-box、workspace-variable-watcher、workspace-plot-header/body。
- **CD-017**: ツールバー（下書き保存・解答送信）を workspace-toolbar、アイコン付きボタン（Bookmark, Send）に。
- **CD-018**: 採点結果ブロックに workspace-judge-success / workspace-judge-fail クラスを付与。
- **CD-019～020**: 採点結果を result-medal-wrap、result-status-badge（112px 円形）、result-status-label、result-tile＋resultTileAppear、result-grading-loading（スピナー＋「採点中」）に変更。globals.css に keyframes とクラスを追加。
- 問題ページ（questions/[questionId]）の一覧へ戻るをボタン＋ArrowLeft に。max-w-6xl に変更。

### Phase 6（管理画面・その他）
- **CD-025～026**: 管理画面（QuestionEditorClient）の input/select/textarea を .form-group でラップし、背景・文字色を var(--color-bg-main)/var(--color-text) で WCAG 準拠。ラベル・ボタンを mock の .btn（btn-primary, btn-ghost, btn-secondary）に。ステータスは FileText/Globe アイコン付き。保存・キャンセルは Save/X アイコン付き。globals.css に .form-group スタイルを追加。
- **CD-029**: 管理画面のナビ（問題一覧・インポート/エクスポート・データセット）をボタン風＋Lucide アイコン。編集・削除をボタン風＋Pencil/Trash2。新規作成に Plus。管理サブページ（編集・新規・インポート・データセット）の「一覧へ戻る」「管理へ戻る」を ArrowLeft＋ボタン風に統一。

## 関連ドキュメントID
- CD-001～CD-029（99_diff/0008）
- SC-003, SC-007, SC-008, SC-009, SC-010
