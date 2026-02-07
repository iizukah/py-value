# 環境変数・シークレットの管理

## 開発環境
- リポジトリには **.env.example** のみをコミットする。実際の値は含めない。
- 開発者は .env.example をコピーして .env を作成し、ローカル用の値を設定する。.env は .gitignore に含める。

## 本番環境（Firebase）
- 本番の環境変数・シークレットは **Firebase Console**（Firebase プロジェクトの設定）で設定する。
- 必要な変数一覧は .env.example に記載し、本番で設定すべきキーを明示する。

## .env.example の例
```
# Firebase（本番は Firebase Console で設定）
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# ... その他必要なキー
```

## 環境の区別
- 開発/本番で接続先・API キーを切り替える。環境変数で `NODE_ENV` や `NEXT_PUBLIC_APP_ENV` 等を用いて判定する。
- 本番への反映手順・ロールバック方針は、別途ドキュメントまたは 99_history で管理する。
