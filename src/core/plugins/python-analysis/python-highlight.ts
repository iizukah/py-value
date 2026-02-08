/**
 * DD-022: Lightweight Python syntax highlight (replaceable by Prism/Monaco later).
 * data-ps は数値のみ使用（"comment" 等の文字列を DOM に出さず、テキストエリアへの混入を防ぐ）。
 */

const PY_KEYWORDS =
  "and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|None|True|False";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  };
  return text.replace(/[&<>"]/g, (ch) => map[ch] ?? ch);
}

export function highlightPython(code: string): string {
  if (!code) return "";
  const keywordRe = new RegExp(`\\b(${PY_KEYWORDS})\\b`, "g");
  let out = escapeHtml(code);
  // data-ps は 0=comment, 1=string, 2=keyword, 3=number（文字列を DOM に載せない）
  out = out.replace(/(#.*)$/gm, '<span data-ps="0">$1</span>');
  out = out.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span data-ps="1">"$1"</span>');
  out = out.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '<span data-ps="1">\'$1\'</span>');
  out = out.replace(keywordRe, '<span data-ps="2">$1</span>');
  out = out.replace(/\b(\d+\.?\d*)\b/g, '<span data-ps="3">$1</span>');
  return out;
}
