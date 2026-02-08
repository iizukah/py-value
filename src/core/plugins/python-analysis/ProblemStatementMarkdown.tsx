"use client";

/**
 * 問題文を Markdown + 数式（LaTeX）で表示。GFM 対応。HTML 許可時は rehype-sanitize で XSS 対策。
 */

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import "katex/dist/katex.min.css";

export interface ProblemStatementMarkdownProps {
  source: string;
  className?: string;
  style?: React.CSSProperties;
}

/** KaTeX が出力する span/div の className 等を許可するため defaultSchema を拡張 */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: Array.isArray(defaultSchema.tagNames)
    ? [...defaultSchema.tagNames, "math", "semantics", "mrow", "msup", "mi", "mo", "mn", "mtext", "mspace", "mover", "munder", "munderover", "msub", "msubsup", "mfrac", "mroot", "msqrt", "mtable", "mtr", "mtd", "mlabeledtr"]
    : defaultSchema.tagNames,
  attributes:
    typeof defaultSchema.attributes === "object" && defaultSchema.attributes
      ? {
          ...defaultSchema.attributes,
          span: ["className", "style", "aria-hidden"],
          div: ["className", "style", "aria-hidden"],
        }
      : defaultSchema.attributes,
};

export function ProblemStatementMarkdown({
  source,
  className = "",
  style = {},
}: ProblemStatementMarkdownProps) {
  if (!source || source.trim() === "") {
    return <span>（問題文なし）</span>;
  }
  return (
    <div className={className} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          [rehypeSanitize, sanitizeSchema],
        ]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-2">{children}</ol>,
          code: ({ className, children, ...props }) => {
            const isInline = !className?.includes("language-");
            if (isInline) {
              return (
                <code className="rounded bg-[rgba(255,255,255,0.08)] px-1 py-0.5 text-[13px]" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded border border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] p-3 text-[13px] mb-2">
              {children}
            </pre>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
