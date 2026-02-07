# 0016 デプロイマニュアルの整理（Cursor/人間の役割・トラブルシューティング）

## 日付

2026-02-08

## 変更内容

- **docs/02_manuals/02_デプロイマニュアル.md** を更新した。
  - **§8 Cursor が自動化できる内容（まとめ）**: API 有効化・プロジェクト設定・IAM 付与・Cloud Run デプロイ・Firebase デプロイ・シード投入（認証済み時）・ファイル・ドキュメント更新を表で整理。
  - **§9 人間がやるべき内容（まとめ）**: プロジェクト・請求・認証・シークレット・コンソール操作・Go/No-Go・動作確認を表で整理。
  - **§10 トラブルシューティング**: 請求未有効・Cloud Build IAM・Application error / TypeError: e is not a function・シード認証・Firestore 複合インデックス・Functions「始める」について、原因と対処（人間 / Cursor の区別）を記載。Cloud Run ログの確認方法を追記。
  - §7 の Cloud Run デプロイコマンドに **GOOGLE_CLOUD_PROJECT** を追加。Firebase デプロイは `--only "hosting,firestore"`（PowerShell で引用符）と firestore.indexes.json のデプロイを明記。

## 関連ドキュメント

- docs/02_manuals/02_デプロイマニュアル.md
