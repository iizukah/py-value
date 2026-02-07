# 0012 E2E Playwright 実施報告（TEST-01 TC-E2E-01, TC-E2E-02）

## 日付

2026-02-07

## 何を実施したか

- **Playwright ブラウザ**: `npx playwright install chromium` で Chromium をインストール済み。
- **設定**: `playwright.config.ts` を追加。`testDir: "src/tests/e2e"`、`webServer` で `npm run dev` 起動、baseURL `http://localhost:3000`。
- **E2E テスト**: TEST-01 §5 の必須範囲のうち、TC-E2E-01・TC-E2E-02 を `src/tests/e2e/home.spec.ts` に実装。
  - **TC-E2E-01**: ルート `/` でホームが表示され、EXER 見出し・キャッチコピー・「Pythonデータ分析 — 問題一覧へ」リンクが表示される。
  - **TC-E2E-02**: 上記リンククリックで `/py-value` に遷移し、h1「Pythonデータ分析」と問題カード（少なくとも1件）が表示される。

## 結果

- **E2E**: 2 テスト すべて Pass（Chromium ヘッドレス、webServer で Next 起動）。

## 修正内容

- 初回実行時、TC-E2E-02 で `getByText('問題一覧')` がリンクと段落の2要素にマッチし strict mode で失敗。アサートを「h1 ＋ 問題カードリンクの存在」に簡略化して解消。

## 関連ドキュメント

- docs/01_specs/05_test/TEST-01_test_plan.md
- playwright.config.ts
- src/tests/e2e/home.spec.ts
