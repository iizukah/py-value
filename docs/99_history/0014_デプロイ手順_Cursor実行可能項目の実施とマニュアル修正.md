# 0014 デプロイ手順の Cursor 実行可能項目の実施とマニュアル修正

## 日付

2026-02-07

## 実施内容

- **チェック**: デプロイマニュアル §7「人間が実施する作業（順不同で事前に実施）」の各項目について、Cursor がコマンドラインで実行可能か検証した。
- **実行したコマンド**（gcloud / Firebase CLI がインストール・認証済みの環境で実施）:
  - `gcloud services enable firestore.googleapis.com --project=snap-mark`
  - `gcloud services enable firebasehosting.googleapis.com --project=snap-mark`
  - `firebase use snap-mark`
- 上記はいずれも成功。API 有効化と Firebase の使用プロジェクト設定は Cursor が非対話で実行可能であることを確認した。
- IAM 付与（`gcloud projects add-iam-policy-binding`）は、PROJECT_ID とメールが既知であれば Cursor が実行可能であることをマニュアルに記載した（実際の付与は未実行）。

## マニュアル修正

- **docs/02_manuals/02_デプロイマニュアル.md**
  - §3.1 の表: 項目 2（API 有効化）・3（IAM 付与）・7（firebase use）に「Cursor が実行可能」と補足を追加。
  - §7 に「Cursor がコマンドラインで実行可能な作業」を新設。実行コマンド（gcloud services enable / firebase use / gcloud projects add-iam-policy-binding）を表で記載。前提として firebase login と gcloud auth は人間が初回実施と明記。
  - §7「人間が実施する作業」の該当項目に※で上記セクション参照を追加。

## 関連ドキュメント

- docs/02_manuals/02_デプロイマニュアル.md
