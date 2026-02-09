"use client";

/**
 * DD-022: Python セル用 Monaco Editor。
 * 非制御: 初期値は defaultValue、入力中は value で上書きしないためカーソルが飛ばない。
 * 外部リセット（下書き読み込み等）時は contentKey を変えて再マウントする。
 */

import { useEffect, useState, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import { decodeHtmlEntities, stripHtmlToPlainText, htmlToPlainText } from "./decode-html-entities";

function toPlain(s: string): string {
  const raw = s ?? "";
  if (/<|&gt;|"py-|class\s*=/.test(raw)) return htmlToPlainText(raw);
  return stripHtmlToPlainText(decodeHtmlEntities(raw));
}

export interface MonacoCodeCellProps {
  value: string;
  onChange: (value: string) => void;
  /** 外部から内容を差し替えたときに変えるキー。変わるとエディタを再マウントして defaultValue を反映する。 */
  contentKey?: string | number;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  style?: React.CSSProperties;
  rows?: number;
}

const MIN_HEIGHT_PX = 72;
const LINE_HEIGHT = 20;
const HEIGHT_PADDING = 4;

export function MonacoCodeCell({
  value,
  onChange,
  contentKey,
  "aria-label": ariaLabel,
  className = "",
  style = {},
  rows = 4,
}: MonacoCodeCellProps) {
  const [height, setHeight] = useState(Math.max(MIN_HEIGHT_PX, rows * LINE_HEIGHT));

  // value に HTML 等が含まれる場合は正規化して親を更新（初回・外部更新時）
  useEffect(() => {
    const normalized = toPlain(value ?? "");
    if (normalized !== value) onChange(normalized);
  }, [value, onChange]);

  const displayValue = toPlain(value ?? "");

  const handleEditorChange = (v: string | undefined) => {
    onChange(v ?? "");
  };

  const editorRef = useRef<{ getContentHeight: () => number } | null>(null);
  const disposableRef = useRef<{ dispose: () => void } | null>(null);

  const updateHeight = useCallback((editor: { getContentHeight: () => number }) => {
    const contentHeight = editor.getContentHeight();
    setHeight((prev) => Math.max(MIN_HEIGHT_PX, contentHeight + HEIGHT_PADDING));
  }, []);

  const handleEditorMount = useCallback(
    (editor: { getContentHeight: () => number; onDidChangeModelContent: (cb: () => void) => { dispose: () => void } }) => {
      editorRef.current = editor;
      updateHeight(editor);
      disposableRef.current?.dispose();
      disposableRef.current = editor.onDidChangeModelContent(() => updateHeight(editor));
    },
    [updateHeight]
  );

  useEffect(() => {
    return () => {
      disposableRef.current?.dispose();
      editorRef.current = null;
    };
  }, []);

  // 外部から value が変わったときも高さを再計算（初期値・貼り付け等）
  useEffect(() => {
    if (editorRef.current) updateHeight(editorRef.current);
  }, [displayValue, updateHeight]);

  const options = {
    minimap: { enabled: false },
    lineNumbers: "off" as const,
    scrollBeyondLastLine: false,
    wordWrap: "on" as const,
    padding: { top: 12, bottom: 12 },
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "ui-monospace, monospace",
    renderLineHighlight: "none" as const,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
  };

  // contentKey が変わったときだけ再マウントして defaultValue を反映（下書き読み込み等）
  const editorKey = contentKey ?? "default";

  return (
    <div
      className={className}
      style={{ minHeight: MIN_HEIGHT_PX, ...style }}
      role="group"
      aria-label={ariaLabel}
    >
      <Editor
        key={editorKey}
        height={height}
        language="python"
        theme="vs-dark"
        defaultValue={displayValue}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        options={options}
        loading={null}
      />
    </div>
  );
}
