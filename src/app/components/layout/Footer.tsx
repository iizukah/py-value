/* CD-028: fixed, footer-status, .online, NODE_ENV 削除 (mock.html) */

export default function Footer() {
  return (
    <footer
      className="app-footer fixed bottom-0 left-0 right-0 w-full border-t px-4 py-3 text-[9px] tracking-[0.15em]"
      style={{
        backgroundColor: "var(--color-bg-main)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-muted)",
        fontFamily: "var(--font-mono), monospace",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      role="contentinfo"
    >
      <div className="footer-status flex gap-4">
        <span className="online text-[var(--color-accent-emerald)]" aria-hidden>
          ● SYSTEM ONLINE
        </span>
      </div>
      <div>EXER FRAMEWORK © 2026</div>
    </footer>
  );
}
