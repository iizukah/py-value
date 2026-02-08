/* CD-006, CD-007, CD-008: first-view-hero, workbook-cards, btn-get-started (mock.html SC-000) */

import Link from "next/link";

export default function HomePage() {
  return (
    <div
      className="first-view relative text-center px-4 py-6"
      style={{ padding: "var(--space-6) var(--space-4)" }}
      role="region"
      aria-label="ファーストビュー"
    >
      <div className="first-view-logo relative z-[1] mb-2" aria-hidden>
        <svg
          width="140"
          height="44"
          viewBox="0 0 130 40"
          className="inline-block align-middle"
          style={{ filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))" }}
        >
          <path
            d="M5 10H25M5 20H18M5 30H25"
            stroke="var(--color-accent-emerald)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="28" cy="20" r="3.5" fill="var(--color-accent-emerald)" />
          <text
            x="42"
            y="32"
            fill="var(--color-text)"
            style={{
              fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            EXER
          </text>
        </svg>
      </div>
      <h1
        className="first-view-hero relative z-[1] mb-4 font-bold leading-tight tracking-tight"
        style={{
          fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          letterSpacing: "-0.02em",
          margin: "0 0 var(--space-4)",
        }}
      >
        Exercise the <span className="text-gradient-emerald">Mind</span>,<br />
        Master the <span className="text-gradient-blue">Skill</span>.
      </h1>
      <p
        className="first-view-p relative z-[1] mx-auto mb-6 max-w-[480px] text-base leading-relaxed text-[var(--color-text-muted)]"
        style={{ margin: "0 auto var(--space-6)" }}
      >
        コードで学ぶ、データ分析。ブラウザだけで問題に挑戦し、採点まで完結します。
      </p>
      <div className="first-view-cta relative z-[1] flex justify-center mb-6">
        <Link
          href="/py-value"
          className="btn btn-primary btn-get-started rounded-full px-8 py-3.5 text-lg font-bold tracking-wide text-white no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-main)] hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, var(--color-accent-emerald) 0%, #0d9488 100%)",
            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
          }}
        >
          GET STARTED
        </Link>
      </div>
      <div className="first-view workbook-cards relative z-[1] flex flex-wrap justify-center gap-4 mt-6">
        <Link
          href="/py-value"
          className="workbook-card block min-w-[260px] rounded-lg border p-4 text-left no-underline text-inherit transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-[rgba(16,185,129,0.4)]"
          style={{
            background: "var(--glass-bg)",
            borderColor: "var(--glass-border)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <span className="label text-[11px] uppercase text-[var(--color-text-muted)] mb-2 block">
            Pythonデータ分析
          </span>
          <p className="typography-heading m-0 text-[1.1rem] font-semibold">
            統計・検定・データ分析の問題にコードで挑戦
          </p>
        </Link>
        <div
          className="workbook-card workbook-card-disabled min-w-[260px] rounded-lg border p-4 text-left opacity-60 text-[var(--color-text-muted)] pointer-events-none cursor-default"
          style={{
            background: "var(--glass-bg)",
            borderColor: "var(--glass-border)",
            backdropFilter: "blur(10px)",
          }}
          aria-disabled
        >
          <span className="label text-[11px] uppercase text-[var(--color-text-muted)] mb-2 block">
            SQL Expert
          </span>
          <p className="typography-heading m-0 text-[1.1rem] font-semibold text-[var(--color-text-muted)]">
            Coming Soon
          </p>
          <p className="workbook-card-desc text-xs text-[var(--color-text-muted)] mt-1">
            複雑なクエリ・最適化
          </p>
        </div>
        <div
          className="workbook-card workbook-card-disabled min-w-[260px] rounded-lg border p-4 text-left opacity-60 text-[var(--color-text-muted)] pointer-events-none cursor-default"
          style={{
            background: "var(--glass-bg)",
            borderColor: "var(--glass-border)",
            backdropFilter: "blur(10px)",
          }}
          aria-disabled
        >
          <span className="label text-[11px] uppercase text-[var(--color-text-muted)] mb-2 block">
            Statistics
          </span>
          <p className="typography-heading m-0 text-[1.1rem] font-semibold text-[var(--color-text-muted)]">
            基礎統計
          </p>
          <p className="workbook-card-desc text-xs text-[var(--color-text-muted)] mt-1">
            統計の基礎
          </p>
        </div>
      </div>
    </div>
  );
}
