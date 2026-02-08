import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-main": "var(--color-bg-main)",
        "bg-secondary": "var(--color-bg-secondary)",
        "text-main": "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "accent-emerald": "var(--color-accent-emerald)",
        "accent-blue": "var(--color-accent-blue)",
        "border-token": "var(--color-border)",
      },
      borderRadius: {
        "token-sm": "var(--radius-sm)",
        "token-md": "var(--radius-md)",
        "token-lg": "var(--radius-lg)",
        "token-pill": "var(--radius-pill)",
      },
      minWidth: {
        tile: "var(--tile-min-width)",
      },
      minHeight: {
        tile: "var(--tile-min-height)",
      },
      maxWidth: {
        "center-block": "var(--center-block-max-width)",
      },
    },
  },
  plugins: [],
};
export default config;
