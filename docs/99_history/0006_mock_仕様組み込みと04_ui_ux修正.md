# 0006 mock 仕様組み込みと 04_ui_ux 修正

## 日付

2026-02-07

## 変更概要

- **mock.html を 04_ui_ux 仕様に組み込み**  
  `docs/.drafts/mock.html` を `docs/01_specs/04_ui_ux/reference/mock.html` にコピーし、見た目の正本として 04_ui_ux 内で参照するようにした。
- **UX-01 / UX-02 / UX-04 を mock 正で修正**  
  各画面・コンポーネント・デザイントークンの記述を reference/mock.html に合わせて更新。採点結果（SC-003/CP-009）は「採点中」ローディング約 2 秒 → バッジ＋Passed/Fail＋結果タイル、Retry／一覧へ戻る構成で記載。
- **プラグインの枠組みデザイン依存を確認**  
  UX-03, ARC-02, REQ-02 を確認。プラグインは枠組みの色・フォントに直接依存しておらず、UX-03 に「枠組みの UX-04 トークン参照可」を明記した。
- **99_diff への追記**  
  `docs/01_specs/99_diff/0003_mock_spec_incorporation.md` を新設し、上記実施内容を記録した。

## 関連ドキュメント

- docs/01_specs/04_ui_ux/（UX-01, UX-02, UX-04, reference/mock.html, plugins/UX-03）
- docs/01_specs/99_diff/0003_mock_spec_incorporation.md
