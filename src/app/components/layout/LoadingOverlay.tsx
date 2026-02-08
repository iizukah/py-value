"use client";

/* CD-027: 共通 loading-overlay, stats-loader, scanning-line (mock.html) */

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type LoadingContextValue = {
  loading: boolean;
  message: string;
  setLoading: (show: boolean, message?: string) => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function useLoading() {
  const ctx = useContext(LoadingContext);
  return ctx ?? { loading: false, message: "LOADING...", setLoading: () => {} };
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoadingState] = useState(false);
  const [message, setMessage] = useState("LOADING...");
  const setLoading = useCallback((show: boolean, msg?: string) => {
    setLoadingState(show);
    if (msg !== undefined) setMessage(msg);
  }, []);
  return (
    <LoadingContext.Provider value={{ loading, message, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export default function LoadingOverlay() {
  const { loading, message } = useLoading();
  if (!loading) return null;
  return (
    <div
      className="loading-overlay fixed inset-0 z-[1000] flex flex-col items-center justify-center opacity-[0.98]"
      style={{ backgroundColor: "var(--color-bg-main)" }}
      role="status"
      aria-live="polite"
      aria-label="読み込み中"
    >
      <div className="stats-loader flex h-[60px] w-[120px] items-end gap-1">
        {[0.2, 0.5, 0.8, 1, 0.8, 0.5, 0.2].map((h, i) => (
          <div
            key={i}
            className="stats-bar rounded-t"
            style={{
              width: 8,
              height: `${h * 100}%`,
              background: "linear-gradient(to top, var(--color-accent-blue), var(--color-accent-emerald))",
              animation: "stats-grow 1.5s ease-in-out infinite",
              animationDelay: `${0.1 * (i + 1)}s`,
            }}
          />
        ))}
      </div>
      <div className="scanning-line relative mt-5 h-0.5 w-[200px] overflow-hidden bg-[rgba(16,185,129,0.2)]">
        <div className="scanning-line-bar" />
      </div>
      <p className="loading-text mt-4 font-mono text-[10px] tracking-[0.2em] text-[var(--color-accent-emerald)]">
        {message}
      </p>
    </div>
  );
}
