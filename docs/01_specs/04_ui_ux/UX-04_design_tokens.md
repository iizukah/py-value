# UX-04 デザイン仕様（トークン・アイコン）

## 1. ドキュメント情報

| 項目 | 内容 |
|------|------|
| **ID** | UX-04 |
| **関連ドキュメント** | REQ-02 §7、UX-02（テーマ・トークン推奨）、[wireframes/wireframes.html](wireframes/wireframes.html)、参考モック（docs/.drafts/mock.html） |

本ドキュメントは、実装時に一貫した見た目を確保するための**デザイントークン**（色・余白・角丸等）と**アイコン方針・一覧**を定義する。UX-02 の「テーマ・トークン（推奨）」を具体化し、ワイヤーフレームおよび参考モックのレイアウト・見た目と対応付ける。実装では CSS 変数（`var(--token-name)`）または Tailwind の theme に反映することを推奨する。

---

## 2. DS-001 カラートークン

REQ-02 §7 および UX-02 §3、ワイヤーフレームの `:root` に基づく。後で変更可能とする。

| トークン名（例） | 値 | 用途 |
|------------------|-----|------|
| `--color-bg-main` | `#0d1117` | メイン背景 |
| `--color-bg-secondary` | `#161b22` | カード・パネル背景 |
| `--color-text` | `#e6edf3` | 本文テキスト |
| `--color-text-muted` | `#8b949e` | 補助テキスト・ラベル |
| `--color-accent-emerald` | `#10b981` | ボタン（主）、リンク、成功状態、バッジ |
| `--color-accent-blue` | `#3b82f6` | ボタン（副）、情報・フォーカス、タブ選択時 |
| `--color-border` | `#30363d` | 枠線・区切り |
| `--color-error-bg` | `#7f1d1d` | エラー表示背景（FR-P011） |
| `--color-error-border` | `#991b1b` | エラー表示枠 |
| `--color-error-text` | `#fecaca` | エラー表示テキスト |
| `--glass-bg` | `rgba(22, 27, 34, 0.75)` | グラスモーフィズム用・カード・ヘッダ背景 |
| `--glass-border` | `rgba(48, 54, 61, 0.6)` | グラスモーフィズム用・枠線 |

- **コントラスト**: テキストと背景のコントラスト比は WCAG 2.1 レベル AA を満たすこと（NFR-F004）。必要に応じて値を調整する。

---

## 3. DS-002 スペーシング

| トークン名（例） | 値 | 用途 |
|------------------|-----|------|
| `--space-1` | `4px` | コンポーネント内の狭い余白 |
| `--space-2` | `8px` | 要素間の標準余白 |
| `--space-3` | `12px` | ヘッダ padding、パネル内余白 |
| `--space-4` | `16px` | セクション間、タイル間 gap |
| `--space-6` | `24px` | 中央ブロック（正解・完了画面）の縦余白 |

- ワイヤーフレームの `.question-tiles` の gap は 16px、`.header-block` の padding は 12px を想定。

---

## 4. DS-003 角丸・シャドウ

| トークン名（例） | 値 | 用途 |
|------------------|-----|------|
| `--radius-sm` | `4px` | 入力フィールド、セルボックス |
| `--radius-md` | `6px` | カード、タブ、パネル |
| `--radius-lg` | `8px` | 問題タイル（CP-003） |
| `--radius-pill` | `999px` | ボタン・バッジのピル形 |

- **ボタン用シャドウ（例）**: 主ボタン `box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35)`、hover 時は強めに。副ボタンは同様に `--color-accent-blue` の rgba。

---

## 5. DS-004 タイポグラフィ

| 項目 | 方針 |
|------|------|
| 本文・UI | **Outfit**（`400`, `600`, `700`）。`system-ui, sans-serif` をフォールバックとする。 |
| ロゴ | **Space Grotesk**（`600`, `700`）。`font-size: 18px`、`letter-spacing: 0.05em`。アクセント色＋軽い `text-shadow` でグロー可。 |
| コード | **JetBrains Mono** または `monospace`。 |
| フォントサイズ | 本文 14px、ラベル 10～11px（uppercase は 10px）、ロゴ・見出し 18px、問題タイトル 1.1rem、バッジ 14px。WCAG を満たすこと。 |
| 行の高さ | 可読性を確保。見出しはやや詰めてよい。 |

---

## 6. DS-005 コンポーネント別レイアウト値

ワイヤーフレーム [wireframes/wireframes.html](wireframes/wireframes.html) と整合する代表値を定義する。実装で Tailwind 等を使う場合も、これらの値に合わせることを推奨する。

| コンポーネント | トークン名（例） | 値 | 備考 |
|----------------|------------------|-----|------|
| 問題タイル（CP-003） | `--tile-min-width` | `280px` | flex タイルの幅。 |
| 問題タイル最小高さ | `--tile-min-height` | `180px` |  |
| 中央ブロック（SC-003, SC-004） | `--center-block-max-width` | `480px` | 合格・完了画面のコンテンツ幅。 |
| 3 ペイン（ワークスペース） | - | グリッド `25% 1fr 30%` | 問題ペイン・エディタ・可視化の比率。UX-03 参照。レスポンシブでは 1fr に変更可。 |
| ボタン | - | `padding: 10px 20px`、`border-radius: 999px` | ピル形。小さいボタンは `padding: 6px 12px`、`font-size: 13px`（.btn-sm）。 |
| バッジ（合格・不合格・未挑戦） | - | `padding: 10px 20px`、`font-size: 14px`、`font-weight: 700`、`border-radius: 999px` | グラデーション＋`filter: drop-shadow` でグロー。下表参照。 |
| ワークスペース Variable Watcher | - | `background: rgba(1, 4, 9, 0.9)` | 左ペイン内の変数表示ボックス。 |
| ワークスペース パネルラベル | - | `font-size: 10px`、`font-weight: 700`、`text-transform: uppercase`、`letter-spacing: 0.08em` | 問題・エディタ・Result Plot 等。 |

### 6.1 バッジ（合格・不合格・未挑戦）

| 種別 | 背景（例） | グロー（drop-shadow 例） |
|------|------------|--------------------------|
| 合格（pass） | `linear-gradient(135deg, #10b981, #0d9488)`、文字色 `#fff` | `0 0 16px rgba(16, 185, 129, 0.5)` |
| 不合格（fail） | `linear-gradient(135deg, #f87171, #dc2626)`、文字色 `#fff` | `0 0 12px rgba(248, 113, 113, 0.5)` |
| 未挑戦（none） | `linear-gradient(135deg, #64748b, #475569)`、文字色 `#e2e8f0` | `0 0 6px rgba(100, 116, 139, 0.3)` |

- 表示時アニメーション（例）: `transform: scale(0.5)→scale(1)`、`opacity: 0→1`。`cubic-bezier(0.34, 1.56, 0.64, 1)` でバウンス感を付与可。

---

## 7. アイコン方針・一覧

### 7.1 方針

- **採用ライブラリ**: **Lucide Icons** を採用する（CDN または npm で読み込み）。
- **アクセシビリティ**: アイコンのみのボタンには `aria-label` または代替テキストを付与する（UX-02 NFR-F004）。

### 7.2 画面・操作とアイコン対応（例）

| 画面・操作 | Lucide アイコン名 | 備考 |
|------------|-------------------|------|
| 解答送信 | send | CP-008 |
| 下書き保存 | bookmark | CP-007 |
| 問題カード CTA | play | 「Try」ボタン |
| 合格・成功 | check-circle | CP-009 |
| 編集 | pencil | 管理・問題編集 |
| 削除 | trash-2 | 管理・問題削除 |
| 一覧へ戻る | arrow-left | ナビゲーション |
| 履歴 | history | ヘッダナビ |
| 詳細（履歴） | eye | 履歴一覧の詳細ボタン |
| 難易度 初級 | circle-dot | 問題カード・タイトル左 |
| 難易度 中級 | bar-chart-2 | 同上 |
| 難易度 上級 | zap | 同上 |
| パンくず ホーム | home | 先頭 |
| パンくず 区切り | chevron-right | 項目間 |
| 実行（Interrupt/リセット） | square / refresh-cw | UX-03 実行制御 |
| ファイル選択（インポート・データセット） | upload | トリガーラベル |

- 上記は実装で使用している例。必要に応じて対応表を更新する。

---

## 8. 実装への反映

- **CSS**: トークンは `:root` またはテーマ用 CSS ファイルで変数として定義し、コンポーネントでは `var(--token-name)` で参照する。
- **Tailwind**: `tailwind.config.js` の `theme.extend` に上記トークンの値を設定し、`bg-[var(--color-bg-main)]` または theme のキー（`backgroundColor.background` 等）で利用する。
- **ワイヤーフレームとの対応**: ワイヤーフレーム [wireframes/wireframes.html](wireframes/wireframes.html) の CSS 変数・クラス値は、本ドキュメントのトークンと一致させることを推奨する。実装がワイヤーフレームのレイアウトを再現する際は、本節のトークンおよび DS-005 の値を参照する。

---

## 9. 参照

- REQ-02 §7 UI/UX（テーマ）
- UX-02 §3 テーマ・トークン（推奨）、§4 アクセシビリティ
- [wireframes/wireframes.html](wireframes/wireframes.html)（レイアウト・色の具体値）
