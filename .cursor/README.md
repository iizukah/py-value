# .cursor 設定（本プロジェクト）

このディレクトリは Cursor のプロジェクトルール・スキル・コミットメッセージ用テンプレートを置く。

## ルール（.cursor/rules/*.mdc）

- **commits-and-history.mdc**: コミットは Conventional Commits。日本語メッセージは **UTF-8 ファイル + `git commit -F`** 必須。文字化け防止のため `-m` は使わない。
- **terminal-powershell.mdc**: **PowerShell では `&&` を使わない**。コマンドの連結は `;` を使う。
- その他: context-and-drafts, dod-and-environments, specs-and-ux-sources, traceability-and-tdd を参照。

## コミットメッセージ（日本語）

1. メッセージを **UTF-8（BOM なし）** でファイルに保存する。例: `.cursor/commit_msg_utf8.txt` または `.git_commit_msg.txt`（こちらは .gitignore 済み）。
2. `git commit -F .cursor/commit_msg_utf8.txt` のように **`-F`** でコミットする。
3. リポジトリで一度だけ: `git config core.quotepath false`、`git config i18n.commitEncoding utf-8`、`git config i18n.logOutputEncoding utf-8` を実行することを推奨。

## 環境

- **シェル**: Windows では PowerShell。`&&` は非対応のため `;` で連結する。
- **パス**: 日本語やスペースを含む場合は引用符で囲む。`git add` で日本語ファイルが問題になる場合はディレクトリ単位で add する。
