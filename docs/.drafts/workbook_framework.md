# 汎用問題集プラットフォーム基盤 (LMS Engine) 要件定義・設計書

## 1. プロジェクトの目的
「学習コンテンツ」と「システム基盤」を完全に分離し、Pythonデータ分析、SQL、統計学など、あらゆる問題集に再利用可能な高拡張性プラットフォームを構築する。

## 2. アーキテクチャ設計指針
- **クリーンアーキテクチャの採用**: Service層、Repository層を分離し、データソース（Firebase/AWS）やロジックの変更に強い構造にする。
- **プラグイン方式**: 問題形式（選択肢、コード、HTML埋め込み等）をコンポーネントとバリデータとして登録可能にする。
- **マルチテナント**: パスベース（`/[workbookId]`）で複数の問題集を切り替える。
- **データポータビリティ**: JSON形式でのインポート/エクスポートをサポートし、Firestoreに永続化する。



## 3. 技術スタック
- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Firestore, Auth, Storage) ※将来のAWS移行を考慮
- **State Management**: TanStack Query (Server State), Web Worker (Judge Logic)
- **Language**: TypeScript (Strict Mode)

## 4. 機能要件

### 4.1 学習機能
- **動的ルーティング & パンくず**: URLパスから階層構造を自動生成。
- **問題表示エンジン**: `type`に応じたプラグインRendererの動的呼び出し。
- **解答プロセス**: 
  - 「開始」ボタンによるセッション開始。
  - 「下書き保存」機能（明示的なトリガー）。
  - Web Workerによる安全な正誤判定。
- **履歴管理**: ユーザーごとの解答履歴一覧および詳細画面。
- **バッジシステム**: 疎結合な付与ロジックとアイコン表示。

### 4.2 管理・運用機能
- **管理画面 (Admin Only)**: 問題CRUD、JSONインポート/エクスポート。
- **i18n**: システム文言の多言語対応（ビルド時静的生成重視）。

## 5. データ構造（型定義案）

```typescript
// src/types/quiz.ts

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionBase {
  id: string;
  title: string;
  category: string; // 階層構造用
  difficulty: Difficulty;
  explanation: string;
  tags: string[];
}

// 可変的な問題形式のプラグイン定義
export type Question = 
  | (QuestionBase & { type: 'multiple-choice'; content: any; answer: any; })
  | (QuestionBase & { type: 'code'; content: any; answer: any; })
  | (QuestionBase & { type: 'html-custom'; content: any; answer: any; });

export interface History {
  id: string;
  userId: string;
  questionId: string;
  workbookId: string;
  status: 'draft' | 'submitted';
  userAnswer: any;
  isCorrect: boolean;
  judgedAt: Date;
  metadata: {
    engineOutput?: string; // 判定ログなど
  };
}

## 6. ディレクトリ構造

```text
/src
  /app
    /[workbookId]/[...path]  <-- 学習画面。workbookId="py-value" 等でアクセス
  /core
    /engine
      /pyodide               <-- Pyodideのロード、カーネル管理、実行制御
    /plugins
      /python-analysis       <-- Py-Value専用プラグイン
        /components          <-- 3ペインレイアウト、MonacoEditor、変数パネル
        /logic               <-- 数値近傍判定 (isclose) などのバリデータ
  /repositories
    /questionRepository.ts   <-- JSON(Lowdb) or Firestore を抽象化
    /historyRepository.ts    <-- 履歴保存
  /public
    /data                    <-- 統計用CSVデータセットの配置場所
```

## 7. 実装ロードマップ

1. Phase 1 (現在): 基盤の型定義、Layout、プラグインレジストリ、MockRepositoryの作成。
2. Phase 2: Firebase Service層の実装、認証、下書き保存機能。
3. Phase 3: 履歴詳細画面、パンくず、i18n対応。
4. Phase 4: Pythonデータ分析用プラグインの開発とコンテンツ投入。