# DATA-01 共有型・スキーマ

## 1. ドキュメント情報

| 項目 | 内容 |
|------|------|
| **ID** | DATA-01 |
| **関連ドキュメント** | REQ-01 §8 共通データ構造、ARC-01、API-01、DATA-02（プラグイン用拡張） |

本ドキュメントは枠組みで共有する型と Firestore/Lowdb のスキーマを定義する。プラグイン用の型・問題 JSON スキーマは **DATA-02**（03_contracts/plugins/）に委ねる。

---

## 2. 共有型定義（TypeScript）

REQ-01 §8 を満たす共有型を以下に定義する。

### 2.1 問題の共通基底（QuestionBase）

問題の共通基底。`type` に応じた拡張フィールドは同一オブジェクトに含めてよく、拡張のスキーマはプラグイン別 DATA-0x（例: DATA-02）を参照する。

```ts
// 問題ステータス
type QuestionStatus = 'draft' | 'published';

// 問題の共通基底（REQ-01 §8）
interface QuestionBase {
  id: string;           // ワークブック内で一意（UUID 等）
  title: string;
  type: string;          // 例: 'python-analysis' → プラグイン識別に使用
  category?: string;
  difficulty?: string;
  explanation?: string;  // 解説（Markdown 等）
  tags?: string[];
  status: QuestionStatus;
  order?: number;       // 登録順・ソート用
  createdAt?: string;   // ISO 8601
  updatedAt?: string;
}
```

- **Question**: `QuestionBase` に type 別の拡張フィールドを付与した型。拡張の定義は DATA-02 等を参照する。実装では `QuestionBase & Record<string, unknown>` やプラグイン別の交差型で表現してよい。

### 2.2 ワークブック（Workbook）

1 つの問題集。URL パス（例: `/py-value`）で一意に識別する。

```ts
interface Workbook {
  id: string;           // パスと一致（例: 'py-value'）
  title: string;
  description?: string;
  historyLimit?: number; // 各問題につき保存する履歴件数上限（デフォルト 10、ワークブック単位）
  createdAt?: string;
  updatedAt?: string;
}
```

- 履歴件数上限はワークブック単位で保持する（FR-F008）。

### 2.3 履歴（History）

解答送信ごとの記録。匿名利用時はクライアント識別子（X-Client-Id）で紐づける。

```ts
type HistoryStatus = 'draft' | 'submitted';

interface History {
  id: string;
  workbookId: string;
  questionId: string;
  clientId: string;     // 匿名識別子（X-Client-Id と対応）
  status: HistoryStatus;
  userAnswer: Record<string, unknown>; // プラグイン契約の枠に載せる（FR-F021）
  isCorrect?: boolean;  // 送信後のみ
  judgedAt?: string;   // ISO 8601
  createdAt: string;
  updatedAt?: string;
}
```

- `userAnswer` の中身の解釈はプラグインが行う。枠組みは永続化・履歴一覧のみを担当する。

### 2.4 下書き（Draft）

解答途中の状態。1 問題につき 1 件で保持し、明示的な操作で上書き保存する。

```ts
interface Draft {
  id: string;
  workbookId: string;
  questionId: string;
  clientId: string;     // 匿名識別子（X-Client-Id と対応）
  userAnswer: Record<string, unknown>;
  updatedAt: string;   // ISO 8601
}
```

---

## 3. Firestore スキーマ

本番環境では Firebase Firestore を使用する。コレクション名とドキュメントのフィールドを以下に定義する。

### 3.1 コレクション一覧

| コレクション | 役割 |
|--------------|------|
| **workbooks** | ワークブックのメタデータ（履歴上限設定等）を格納する。 |
| **questions** | 問題データ。**フラット**な 1 コレクションとし、ドキュメントに `workbookId` を持たせ、クエリで絞る。 |
| **histories** | 解答履歴。`workbookId` + `questionId` + `clientId` 等でクエリ。 |
| **drafts** | 下書き。`workbookId` + `questionId` + `clientId` で一意。 |

### 3.2 workbooks

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | string | ドキュメント ID。パスと一致（例: py-value）。 |
| title | string | タイトル |
| description | string | 任意 |
| historyLimit | number | 各問題の履歴件数上限（デフォルト 10） |
| createdAt | string | ISO 8601 |
| updatedAt | string | ISO 8601 |

### 3.3 questions（フラット）

**questions はフラット**なコレクションとする。ドキュメントに `workbookId` を持たせ、クエリでワークブックを絞る。共通基底フィールドと **type に応じた拡張フィールドを同一ドキュメントに含めてよい**。拡張のスキーマはプラグイン別 DATA-0x（例: DATA-02）を参照する。

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | string | ワークブック内で一意 |
| workbookId | string | 所属ワークブック |
| title | string | 問題タイトル |
| type | string | プラグイン識別（例: python-analysis） |
| category | string | 任意 |
| difficulty | string | 任意 |
| explanation | string | 任意（Markdown 等） |
| tags | string[] | 任意 |
| status | 'draft' \| 'published' | 下書き / 公開 |
| order | number | 登録順・ソート用 |
| createdAt | string | ISO 8601 |
| updatedAt | string | ISO 8601 |
| （拡張） | 各種 | type に応じたフィールド（DATA-02 等参照） |

### 3.4 histories

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | string | ドキュメント ID |
| workbookId | string | ワークブック ID |
| questionId | string | 問題 ID |
| clientId | string | 匿名識別子 |
| status | 'draft' \| 'submitted' | 送信済みは submitted |
| userAnswer | map | プラグイン契約の枠（JSON 互換） |
| isCorrect | boolean | 送信後のみ |
| judgedAt | string | ISO 8601 |
| createdAt | string | ISO 8601 |
| updatedAt | string | ISO 8601 |

### 3.5 drafts

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | string | ドキュメント ID（workbookId + questionId + clientId の合成等） |
| workbookId | string | ワークブック ID |
| questionId | string | 問題 ID |
| clientId | string | 匿名識別子 |
| userAnswer | map | プラグイン契約の枠（JSON 互換） |
| updatedAt | string | ISO 8601 |

---

## 4. Lowdb 互換（開発環境）

開発時は Lowdb（JSON ベース）を使用する。**同じ型で JSON 化**し、Firestore のコレクションと対応するファイル（例: `workbooks.json`, `questions.json`, `histories.json`, `drafts.json`）で永続化する。スキーマは本ドキュメントの型・Firestore スキーマと互換を保つ。

- 実装では Repository の Lowdb 実装が上記 JSON を読み書きし、本番の Firestore 実装とインターフェースを共有する（ARC-01-005 参照）。

---

## 5. 履歴上限・ワークブック単位の表現

- 履歴件数上限（N）は **ワークブック単位**で保持する（REQ-01 FR-F008）。`Workbook.historyLimit`（デフォルト 10）で表現する。
- 各問題につき直近 N 件を超える履歴は、保存時またはバッチで削除する方針とする。削除ポリシーの詳細は実装または INFRA で定める。

---

## 6. 参照

- REQ-01 §8 共通データ構造
- ARC-01 システム設計（環境切り替え ARC-01-005）
- API-01 REST 契約（X-Client-Id による識別子の受け渡し）
- DATA-02 データ分析プラグイン用型・スキーマ（03_contracts/plugins/）
