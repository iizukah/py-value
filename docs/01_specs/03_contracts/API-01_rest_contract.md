# API-01 REST 契約（枠組み）

## 1. ドキュメント情報

| 項目 | 内容 |
|------|------|
| **ID** | API-01 |
| **関連ドキュメント** | DATA-01（共有型）、REQ-01 FR-F011〜F015, FR-F020、openapi.yaml |

本ドキュメントは**契約のみ**を定義する。実装は Next.js Route Handlers でも別サーバーでもよい。**正本は 03_contracts/openapi.yaml** とし、本ドキュメントはその説明・一覧として参照する。

---

## 2. 共通仕様

### 2.1 匿名識別子（X-Client-Id）

履歴・下書きの紐づけに使用する匿名識別子は、**X-Client-Id** ヘッダで送る。クライアントは同一ブラウザで同じ識別子を保持し、サーバーはこれをキーに履歴・下書きを保存・取得する。

- 対象 API: 履歴一覧・履歴詳細・下書き取得・下書き保存・解答送信
- 未指定時: 400 Bad Request 等でエラーを返してよい（openapi.yaml の各パスを参照）

### 2.2 管理系 API の認可

管理系 API（問題 CRUD、インポート/エクスポート、データセットアップロード）は、**クエリ key を検証する**。検証の実装（キー照合の場所・エラー応答）は INFRA または実装に任せる。

---

## 3. エンドポイント一覧

以下は openapi.yaml に対応する一覧である。パス・メソッド・スキーマの詳細は **openapi.yaml** を参照すること。

| ID | メソッド | パス | 概要 |
|----|----------|------|------|
| API-001 | GET | /api/workbooks | ワークブック一覧取得 |
| API-002 | GET | /api/workbooks/{workbookId} | ワークブック取得 |
| API-003 | GET | /api/workbooks/{workbookId}/questions | 問題一覧取得（公開済みのみ。sort=order\|difficulty\|title） |
| API-004 | GET | /api/workbooks/{workbookId}/questions/{questionId} | 問題 1 件取得 |
| API-005 | GET | /api/workbooks/{workbookId}/histories | 履歴一覧取得（X-Client-Id 必須） |
| API-006 | GET | /api/workbooks/{workbookId}/histories/{historyId} | 履歴詳細取得（X-Client-Id 必須、自分の履歴のみ） |
| API-007 | GET | /api/workbooks/{workbookId}/questions/{questionId}/draft | 下書き取得（X-Client-Id 必須） |
| API-008 | PUT | /api/workbooks/{workbookId}/questions/{questionId}/draft | 下書き保存（X-Client-Id 必須、1 問題 1 件で上書き） |
| API-009 | POST | /api/workbooks/{workbookId}/questions/{questionId}/submit | 解答送信（X-Client-Id 必須、body: { userAnswer }、JudgeResult を返す） |
| API-010 | GET | /api/admin/workbooks/{workbookId}/questions?key=xxx | 問題一覧（管理・下書き含む）。key 検証。 |
| API-011 | POST | /api/admin/workbooks/{workbookId}/questions?key=xxx | 問題作成（管理）。key 検証。 |
| API-012 | GET | /api/admin/workbooks/{workbookId}/questions/{questionId}?key=xxx | 問題取得（管理）。key 検証。 |
| API-013 | PUT | /api/admin/workbooks/{workbookId}/questions/{questionId}?key=xxx | 問題更新（管理）。key 検証。 |
| API-014 | DELETE | /api/admin/workbooks/{workbookId}/questions/{questionId}?key=xxx | 問題削除（管理）。key 検証。 |
| API-015 | POST | /api/admin/workbooks/{workbookId}/import?key=xxx | 問題 JSON インポート（管理）。1 件でもバリデーションエラーがあれば全体拒否。key 検証。 |
| API-016 | GET | /api/admin/workbooks/{workbookId}/export?key=xxx | 問題 JSON エクスポート（管理）。全問題を 1 配列で返す。データセットは参照のみ。key 検証。 |
| API-017 | POST | /api/admin/workbooks/{workbookId}/datasets?key=xxx | データセット（CSV）アップロード（管理）。key 検証。 |

---

## 4. 成功時レスポンス型・エラー

- **成功時**: 各パスに対応するスキーマは openapi.yaml の `components.schemas` および各レスポンスを参照する。Question は DATA-01 の共通基底と type 別拡張（DATA-02 参照）を同一オブジェクトに含めてよい。
- **エラー**: `{ code: string, message: string }` 形式。HTTP ステータスは 400（バリデーション・X-Client-Id 未指定等）、401（key 検証失敗）、403（他クライアントの履歴アクセス）、404（Not Found）、500（サーバーエラー）を用いる。詳細は openapi.yaml の各パスの responses を参照する。

---

## 5. 参照

- **openapi.yaml**（03_contracts/openapi.yaml）: 正本。パス・メソッド・スキーマ・X-Client-Id を機械可読で定義する。
- DATA-01 共有型・Firestore スキーマ
- REQ-01 FR-F011〜F015（管理機能）、FR-F020（枠組みが提供する API）
