/**
 * Decode HTML entities (e.g. &#39; → ', &quot; → ") for pasted or loaded cell content.
 * セミコロンなしの数値実体（&#39 等）にも対応する。
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#(\d+)(?!\d)(?!;)/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#x([0-9a-fA-F]+)(?![0-9a-fA-F])(?!;)/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * コピペで混入した HTML タグ・属性の残骸を除去しプレーンテキストにする。
 * セル表示・初期値・ドラフト復元の正規化で共通利用。
 * 必ず先に decode してからタグ除去（&lt;&gt; のままでは正規表現がマッチしない）。
 */
export function stripHtmlToPlainText(s: string): string {
  let t = decodeHtmlEntities(s);
  let prev: string;
  // class=class="py-string""py-comment"> 等の残骸を除去（繰り返し適用）
  do {
    prev = t;
    t = t.replace(/<[^>]+>/g, "");
    // class=class="py-string""py-comment"> など（隣接する "py-xxx" もまとめて除去）
    t = t.replace(/\bclass\s*=\s*class\s*=\s*"(?:py-[a-z-]+")+\s*>\s*/g, "");
    t = t.replace(/\bclass\s*=\s*class\s*=\s*"(?:py-[a-z-]+")+/g, "");
    t = t.replace(/\bclass\s*=\s*class\s*=\s*'py-[a-z-]+'\s*>\s*/g, "");
    t = t.replace(/\bclass\s*=\s*"py-[a-z-]+"\s*>\s*/g, "");
    t = t.replace(/\bclass\s*=\s*'py-[a-z-]+'\s*>\s*/g, "");
    t = t.replace(/"py-[a-z-]+"\s*>\s*/g, "");
    t = t.replace(/'py-[a-z-]+'\s*>\s*/g, "");
    // data-ps 残骸（ハイライト用 span が value に混入した場合）。comment/string/keyword/number および数値コード 0-3
    t = t.replace(/\bdata-ps\s*=\s*["\u201C\u201D](?:comment|string|keyword|number|[0-3])["\u201C\u201D]\s*>\s*/g, "");
    t = t.replace(/["\u201C\u201D](?:comment|string|keyword|number|[0-3])["\u201C\u201D]>\s*/g, "");
    t = t.replace(/\bclass\s*=\s*(?:class\s*=\s*)?["']?[^"'>]*["']?\s*>\s*/g, "");
    t = t.replace(/\bclass\s*=\s*(?="py-|'py-)/g, "");
    t = t.replace(/^\s*class\s*=\s*/gm, "");
  } while (prev !== t);
  return t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * HTML 文字列からプレーンテキストを取得（DOM パース利用）。
 * クリップボードの text/html や text/plain に HTML が含まれる場合に使用。
 */
export function htmlToPlainText(html: string): string {
  if (typeof document === "undefined") return stripHtmlToPlainText(html);
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent ?? (div as unknown as { innerText?: string }).innerText ?? "";
  return stripHtmlToPlainText(text);
}
