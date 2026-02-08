export default function Footer() {
  return (
    <footer
      className="border-t px-4 py-3 text-center text-sm"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-muted)",
      }}
      role="contentinfo"
    >
      <span aria-hidden="true">SYSTEM ONLINE</span>
      <span className="mx-2" aria-hidden="true">|</span>
      <span>EXER FRAMEWORK</span>
    </footer>
  );
}
