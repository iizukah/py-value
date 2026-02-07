# 0003 mock 仕様組み込み（04_ui_ux 修正）

## 日付

2026-02-07

## 実施内容

1. **04_ui_ux/reference の新設と mock コピー**
   - `docs/01_specs/04_ui_ux/reference/` を新設し、`docs/.drafts/mock.html` を `docs/01_specs/04_ui_ux/reference/mock.html` にコピーした。.drafts のファイルはそのまま残す。

2. **UX-01_screens.md を mock 正で修正**
   - 見た目の正本を [reference/mock.html](reference/mock.html) に変更。ワイヤーフレームは補助参照とした。
   - SC-000: ファーストビュー（Exercise the Mind, Master the Skill.／GET STARTED／問題集カード）、ロゴ・ファビコン、背景アニメ、フッターを記載。
   - SC-001: タイルグリッド・ソート・タグフィルター、一覧下部の「お気に入り」「履歴へ」は設けずヘッダーから遷移する旨を記載。
   - SC-003: 採点中ローディング約 2 秒 → バッジ＋Passed/Fail＋結果タイル、Retry／一覧へ戻る。99_diff 0002 の未対応 To-Do（タイル幅・Retry 位置）は「今後の改善」として言及。
   - SC-005, SC-006, SC-011: 合格・不合格、履歴詳細・お気に入り一覧のパネル構成を mock に合わせて文言調整。

3. **UX-02_components.md を mock 正で修正**
   - CP-001: ヘッダー（ロゴ SVG・ナビ：問題一覧・お気に入り・履歴・管理）、フッター（SYSTEM ONLINE／EXER FRAMEWORK）を追記。mock 参照を明記。
   - CP-000, CP-015: ファーストビュー・問題集カード（GET STARTED、Data Analysis／SQL Expert Coming Soon／Statistics）を mock 準拠で記載。
   - CP-009: 採点結果はバッジ＋ラベル＋約 2 秒ローディングとする旨を追記。

4. **UX-04_design_tokens.md**
   - 参照を「参考モック [reference/mock.html](../04_ui_ux/reference/mock.html)」に変更（04_ui_ux 内の reference を参照）。mock のトークンと矛盾しないよう注釈を追加。

5. **プラグインの枠組みデザイン依存チェック**
   - UX-03, ARC-02, REQ-02 を確認。プラグインは枠組みの色・フォントに直接依存しておらず、SC-002 のコンテナ・ルーティングおよび CP-007/CP-008/CP-009 の配置方針にのみ依存している。
   - **UX-03 に明記**: 枠組みの UX-04 デザイントークン（CSS 変数）の参照は可能。具体的な色・余白のハードコードは避ける。

## 関連

- 99_history: 0006_mock_仕様組み込みと04_ui_ux修正.md
- 99_diff 0002: 採点結果画面のタイル幅・Retry 位置は今後の改善として UX-01 SC-003 に言及済み。
