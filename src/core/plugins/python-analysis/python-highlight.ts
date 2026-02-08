/**
 * DD-022: Lightweight Python syntax highlight (replaceable by Prism/Monaco later).
 * Escapes HTML and wraps keywords, strings, comments in spans for styling.
 */

const PY_KEYWORDS =
  "and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|None|True|False";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}

export function highlightPython(code: string): string {
  if (!code) return "";
  const keywordRe = new RegExp(`\\b(${PY_KEYWORDS})\\b`, "g");
  let out = escapeHtml(code);
  // Comments (# to EOL)
  out = out.replace(/(#.*)$/gm, '<span class="py-comment">$1</span>');
  // Double-quoted strings (simple: no escape inside)
  out = out.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="py-string">"$1"</span>');
  // Single-quoted strings
  out = out.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, "<span class=\"py-string\">'$1'</span>");
  // Keywords (after strings/comments so we don't double-wrap)
  out = out.replace(keywordRe, '<span class="py-keyword">$1</span>');
  // Builtins / numbers simple pass-through; optional: number highlight
  out = out.replace(/\b(\d+\.?\d*)\b/g, '<span class="py-number">$1</span>');
  return out;
}
