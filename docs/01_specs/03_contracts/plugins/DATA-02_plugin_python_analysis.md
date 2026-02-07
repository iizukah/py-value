# DATA-02 データ分析プラグイン用型・スキーマ（EXER 第一版）

## 1. ドキュメント情報

| 項目 | 内容 |
|------|------|
| **ID** | DATA-02 |
| **プロジェクト名** | EXER |
| **関連ドキュメント** | REQ-02 §6 問題データ構造、DATA-01（共有型・QuestionBase、favoriteCount 含む）、ARC-02（プラグイン構成） |

本ドキュメントはデータ分析プラグイン用の問題 JSON スキーマ、JudgeResult 等の型、仮想 FS・Pyodide 周りのデータ形式を定義する。REQ-02 §6 の確定版である。

---

## 2. 問題 JSON スキーマ（データ分析プラグイン用）

DATA-01 の QuestionBase に加え、`type: 'python-analysis'` の場合の拡張フィールドを以下に定義する。同一ドキュメントに共通基底と拡張を併記してよい。

### 2.1 拡張フィールド

| フィールド | 型 | 必須 | 説明 |
|------------|-----|------|------|
| problem_statement | string | 推奨 | 問題文（Markdown） |
| initial_code | string | 任意 | 初期コード。空の場合は空の 1 セルとする（FR-P007） |
| explanation | string | 任意 | 解説（Markdown） |
| dataset | DatasetRef | 任意 | データセット参照（file_name, url または path） |
| validation | Validation | 必須 | 採点方法・期待値・許容誤差等 |
| watchVariables | string[] | 任意 | 変数監視する変数名の配列（例: ["ans", "p_value"]）。問題データで固定指定（FR-P004） |

### 2.2 DatasetRef

| フィールド | 型 | 説明 |
|------------|-----|------|
| file_name | string | ファイル名（例: data.csv） |
| url | string | 本番用 URL（Firebase Storage 等） |
| path | string | 開発用パス（例: /data/data.csv） |

本番では Firebase Storage、開発では静的ファイル（例: `public/data/`）を参照する（FR-P002）。

### 2.3 Validation

| フィールド | 型 | 説明 |
|------------|-----|------|
| method | 'value_match' \| 'script' \| 'ml_test' | 採点方法。value_match: 変数値の一致、script: 隠しテストスクリプト、ml_test: 機械学習相対評価 |
| expected_value | number \| number[] | 期待値（value_match 時）。数値または配列 |
| tolerance | { atol?: number, rtol?: number } | 許容誤差。atol: 絶対誤差、rtol: 相対誤差。例: atol 1e-5, rtol 1e-3（FR-P008） |
| baseline_value | number | ベースライン（ml_test 時。参考値） |
| hidden_test_script | string | 隠しテスト用 Python スクリプト（script 時） |
| hint | string | ヒント文 |
| expectedPlot? | object | Matplotlib 期待値（相関 r > 0.99 等、FR-P009）。指定がない限り見た目は採点対象外 |

---

## 3. プラグイン内 TypeScript 型

### 3.1 ユーザー解答（userAnswer）

下書き・解答送信時に枠組みが永続化する形式。プラグインは中身を解釈する（FR-F021）。

```ts
// データ分析プラグイン用 userAnswer
interface PythonAnalysisUserAnswer {
  cells?: { id: string; content: string }[];  // セル単位のコード。採点時は全セル結合
  // その他プラグイン固有のフィールドは任意
}
```

- 枠組みは `Record<string, unknown>` として扱い、プラグインが `PythonAnalysisUserAnswer` にキャストして利用する。

### 3.2 JudgeResult

判定アダプタが返す型。API-01 の解答送信レスポンスおよび openapi.yaml の JudgeResult と整合させる。

```ts
interface JudgeResult {
  isCorrect: boolean;
  message?: string;       // フィードバック用
  details?: {
    kind?: 'value_match' | 'script' | 'ml_test' | 'timeout' | 'runtime_error' | 'judge_error';
    expected?: unknown;
    actual?: unknown;
    correlation?: number;  // Matplotlib 相関（FR-P009）
    accuracy?: number;     // ML 相対評価（FR-P010）
  };
}
```

- エラー種別（タイムアウト、実行エラー、採点エラー等）は details.kind で表現する（FR-P011）。

### 3.3 問題拡張型（実装用）

```ts
import type { QuestionBase } from '../data-01';  // 参照パスは実装に合わせる

interface PythonAnalysisValidation {
  method: 'value_match' | 'script' | 'ml_test';
  expected_value?: number | number[];
  tolerance?: { atol?: number; rtol?: number };
  baseline_value?: number;
  hidden_test_script?: string;
  hint?: string;
  expectedPlot?: object;
}

interface DatasetRef {
  file_name: string;
  url?: string;
  path?: string;
}

interface QuestionPythonAnalysis extends QuestionBase {
  type: 'python-analysis';
  problem_statement?: string;
  initial_code?: string;
  explanation?: string;
  dataset?: DatasetRef;
  validation: PythonAnalysisValidation;
  watchVariables?: string[];
}
```

---

## 4. 仮想 FS・Pyodide 周りのデータ形式

### 4.1 仮想 FS への配置

- **データセット**: 問題の `dataset` に従い、Pyodide の仮想 FS（例: `/data/<file_name>`）に CSV 等を配置する。配置は枠組みまたはプラグインが、開発時は `fetch` で静的ファイルを取得し、本番では Firebase Storage の URL から取得してから Pyodide に書き込む。
- **パス規則**: 問題データの `dataset.file_name` をそのまま仮想 FS のファイル名に用いてよい。例: `file_name: "data.csv"` → 仮想 FS 上は `/data/data.csv` 等、実装で定める。

### 4.2 コード実行時の入出力

- **入力**: 全セルのコードを結合した 1 つの文字列。タイムアウトは 60 秒（FR-P006）。
- **出力**: 標準出力・標準エラーは実行結果として保持。変数監視対象（watchVariables）の値は Pyodide 実行後に取得し、サイドパネル用に渡す。Matplotlib の描画結果は DOM に投影する（FR-P003）。

### 4.3 データセット取得元

| 環境 | 取得元 |
|------|--------|
| 開発 | 静的ファイル（例: `public/data/<file_name>`）または path |
| 本番 | Firebase Storage の url、または枠組みが用意するダウンロード URL |

---

## 5. トレーサビリティ

本ドキュメントで定義する型・スキーマは、REQ-02 FR-P001～FR-P011、UC-P01～UC-P08、DATA-01 QuestionBase（tags 等）、API-01 解答送信レスポンス（JudgeResult）と対応する。

---

## 6. 参照

- REQ-02 §6 問題データ構造
- DATA-01 共有型・Firestore スキーマ（questions の拡張は本ドキュメント）
- ARC-02 データ分析プラグイン構成
- API-01 / openapi.yaml（JudgeResult レスポンス）
