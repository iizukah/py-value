# 0030: デバッグ — LoadingOverlay import 修正

- **日付**: 2025-02-07
- **現象**: `npm run dev` でトップ `/` アクセス時に 500。コンソールに `'LoadingOverlay' is not exported from './components/layout/LoadingOverlay'`、`Unsupported Server Component type: undefined`。

## 原因

- `src/app/components/layout/LoadingOverlay.tsx` では `LoadingOverlay` を **default export** している（`export default function LoadingOverlay()`）。
- `src/app/layout.tsx` では **named import** で `import { LoadingProvider, LoadingOverlay } from "..."` としていた。
- デフォルト export を名前付きで import すると `LoadingOverlay` が `undefined` になり、レンダー時に「Unsupported Server Component type: undefined」が発生。

## 修正内容

- **ファイル**: `src/app/layout.tsx`
- **変更**: `import { LoadingProvider, LoadingOverlay } from "..."` を  
  `import LoadingOverlay, { LoadingProvider } from "..."` に変更（LoadingOverlay を default import、LoadingProvider を named import に統一）。

## 結果

- ルートレイアウトで `LoadingOverlay` が正しく解決され、`/` が 500 にならず表示される想定。再起動後に `GET /` が 200 になることを確認すること。
