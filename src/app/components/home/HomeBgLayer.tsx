"use client";

/* CD-005: home-bg-layer, fvGridMove, fv-shape, fv-light-sweep (mock.html) */

import { usePathname } from "next/navigation";

export default function HomeBgLayer() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div
      id="home-bg-layer"
      className="home-bg-layer pointer-events-none fixed inset-0 -z-[1]"
      aria-hidden
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(16, 185, 129, 0.04) 48px, rgba(16, 185, 129, 0.04) 49px),
          repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(16, 185, 129, 0.04) 48px, rgba(16, 185, 129, 0.04) 49px)
        `,
        backgroundSize: "100% 100%",
        animation: "fvGridMove 20s linear infinite",
      }}
    >
      <span
        className="fv-shape fv-shape-1 absolute rounded-full border border-[rgba(16,185,129,0.2)]"
        style={{
          width: 120,
          height: 120,
          left: "8%",
          top: "15%",
          animation: "fvFloat 8s ease-in-out infinite",
        }}
      />
      <span
        className="fv-shape fv-shape-2 absolute border border-[rgba(16,185,129,0.2)]"
        style={{
          width: 60,
          height: 60,
          right: "12%",
          top: "25%",
          borderRadius: 4,
          animation: "fvFloat 10s ease-in-out infinite",
          animationDelay: "-2s",
        }}
      />
      <span
        className="fv-shape fv-shape-3 absolute rounded-full border border-[rgba(16,185,129,0.2)]"
        style={{
          width: 80,
          height: 80,
          left: "20%",
          bottom: "20%",
          animation: "fvFloat 12s ease-in-out infinite",
          animationDelay: "-4s",
        }}
      />
      <span
        className="fv-shape fv-shape-4 absolute rounded-full border border-[rgba(16,185,129,0.2)]"
        style={{
          width: 40,
          height: 40,
          right: "25%",
          bottom: "30%",
          animation: "fvFloat 6s ease-in-out infinite",
          animationDelay: "-1s",
        }}
      />
      <span
        className="fv-shape fv-shape-5 absolute border border-[rgba(16,185,129,0.2)]"
        style={{
          width: 100,
          height: 100,
          right: "8%",
          top: "50%",
          borderRadius: 8,
          animation: "fvFloat 9s ease-in-out infinite",
          animationDelay: "-3s",
        }}
      />
      <span
        className="fv-shape fv-shape-6 absolute rounded-full border border-[rgba(16,185,129,0.2)]"
        style={{
          width: 50,
          height: 50,
          left: "15%",
          top: "45%",
          animation: "fvFloat 11s ease-in-out infinite",
          animationDelay: "-5s",
        }}
      />
      <span
        className="fv-light-sweep absolute left-0 top-0 h-full w-[60%]"
        style={{
          left: "-100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.08) 40%, rgba(16, 185, 129, 0.12) 50%, rgba(16, 185, 129, 0.08) 60%, transparent 100%)",
          animation: "fvSweep 4s ease-in-out infinite",
        }}
      />
      <span
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}
