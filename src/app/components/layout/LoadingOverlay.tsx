"use client";

/* CD-027: 共通 loading-overlay, stats-loader (ヒストグラムのみ) */

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
      <div
        className="stats-loader flex items-end"
        style={{ height: 100, width: 202, gap: 6 }}
      >
        {[0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1, 0.9, 0.8, 0.65, 0.5, 0.35, 0.2].map((h, i) => (
          <div
            key={i}
            className="stats-bar rounded-t"
            style={{
              width: 10,
              height: `${h * 100}%`,
              background: "linear-gradient(to top, var(--color-accent-blue), var(--color-accent-emerald))",
              animation: "stats-grow 1.6s ease-in-out infinite",
              animationDelay: `${(i + 1) * 0.12}s`,
              // 底に近いバーは伸びを抑え、頂上だけ大きく
              ["--stats-grow-max" as string]: 1 + h * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}
