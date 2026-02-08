"use client";

/**
 * DD-022: Code input with Python syntax highlight overlay.
 * Replaceable by Monaco/CodeMirror by swapping this component.
 */

import { useRef, useEffect, useCallback } from "react";
import { highlightPython } from "./python-highlight";

const HIGHLIGHT_STYLES = `
  .py-keyword { color: #c678dd; }
  .py-string { color: #98c379; }
  .py-comment { color: #6a737d; }
  .py-number { color: #d19a66; }
  code { color: var(--color-text); }
`;

export interface CodeInputWithHighlightProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  style?: React.CSSProperties;
  rows?: number;
}

export function CodeInputWithHighlight({
  value,
  onChange,
  placeholder = "コードを入力...",
  "aria-label": ariaLabel,
  className = "",
  style = {},
  rows = 4,
}: CodeInputWithHighlightProps) {
  const mirrorRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    const pre = mirrorRef.current;
    if (ta && pre) {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
    }
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const onScroll = () => {
      if (mirrorRef.current) {
        mirrorRef.current.scrollTop = ta.scrollTop;
        mirrorRef.current.scrollLeft = ta.scrollLeft;
      }
    };
    ta.addEventListener("scroll", onScroll);
    return () => ta.removeEventListener("scroll", onScroll);
  }, []);

  const highlighted = highlightPython(value || "");
  const displayValue = value || "";

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const ta = textareaRef.current;
      if (!ta) return;
      e.preventDefault();
      const raw = e.clipboardData.getData("text/plain");
      const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = value.slice(0, start);
      const after = value.slice(end);
      onChange(before + normalized + after);
    },
    [onChange, value]
  );

  return (
    <div className="relative h-full min-h-0 w-full" style={{ isolation: "isolate" }}>
      <style dangerouslySetInnerHTML={{ __html: HIGHLIGHT_STYLES }} />
      <pre
        ref={mirrorRef}
        className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words rounded font-mono text-[13px]"
        style={{
          margin: 0,
          padding: "12px 14px",
          lineHeight: 1.5,
          boxSizing: "border-box",
          color: "var(--color-text)",
          ...style,
        }}
        aria-hidden
      >
        <code dangerouslySetInnerHTML={{ __html: highlighted || " " }} />
      </pre>
      <textarea
        ref={textareaRef}
        className={`cell-input h-full min-h-[72px] w-full resize-y rounded font-mono text-[13px] outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-accent-emerald)] ${className}`}
        style={{
          position: "relative",
          backgroundColor: "transparent",
          color: "transparent",
          caretColor: "var(--color-accent-emerald)",
          lineHeight: 1.5,
          padding: "12px 14px",
          boxSizing: "border-box",
          ...style,
        }}
        rows={rows}
        value={displayValue}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        onScroll={handleScroll}
        spellCheck={false}
        aria-label={ariaLabel}
      />
    </div>
  );
}
