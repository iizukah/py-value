"use client";

/**
 * DD-022: Python セル用コード入力。
 * Monaco Editor を dynamic import（ssr: false）で使用。同一 props で差し替え可能。
 */

import dynamic from "next/dynamic";
import type { MonacoCodeCellProps } from "./MonacoCodeCell";

const MonacoCodeCell = dynamic(
  () => import("./MonacoCodeCell").then((m) => m.MonacoCodeCell),
  { ssr: false, loading: () => <CodeInputLoading /> }
);

function CodeInputLoading() {
  return (
    <div
      className="min-h-[72px] w-full rounded font-mono text-[13px] flex items-center justify-center text-[var(--color-text-muted)]"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        color: "#e6edf3",
      }}
      aria-hidden
    >
      読み込み中…
    </div>
  );
}

export type CodeInputWithHighlightProps = MonacoCodeCellProps;

export function CodeInputWithHighlight(props: CodeInputWithHighlightProps) {
  return <MonacoCodeCell {...props} />;
}
