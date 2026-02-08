import Link from "next/link";

export default function HomePage() {
  return (
    <div
      className="mx-auto max-w-2xl px-6 py-12"
      style={{ paddingBlock: "var(--space-6)" }}
      role="region"
      aria-label="ファーストビュー"
    >
      <h1
        className="text-2xl font-bold tracking-wide"
        style={{
          fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
          color: "var(--color-text)",
        }}
      >
        EXER
      </h1>
      <p className="mt-2 text-[var(--color-text-muted)]" style={{ fontSize: "1rem" }}>
        Exercise the Mind, Master the Skill.
      </p>
      <div className="mt-8">
        <Link
          href="/py-value"
          className="inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-main)] hover:opacity-90"
          style={{
            backgroundColor: "var(--color-accent-emerald)",
            boxShadow: "var(--shadow-btn-primary)",
          }}
        >
          GET STARTED
        </Link>
      </div>
    </div>
  );
}
