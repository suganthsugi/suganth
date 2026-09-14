import type { Config } from "tailwindcss";

// Design tokens live here as CSS-variable-backed colors so the palette can be
// swapped to match the Claude Design `Portfolio.dc.html` import in one place.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        bg2: "rgb(var(--bg2) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        ink2: "rgb(var(--ink2) / <alpha-value>)",
        line: "rgb(var(--line) / var(--line-a))",
        accent: "rgb(var(--accent) / <alpha-value>)",
        ambient: "rgb(var(--ambient) / var(--ambient-a))",
        glow: "rgb(var(--glow) / var(--glow-a))",
        star: "rgb(var(--star) / <alpha-value>)",
        halo: "rgb(var(--halo) / var(--halo-a))",
        // legacy aliases kept for admin screens not yet reskinned
        surface: "rgb(var(--bg2) / <alpha-value>)",
        "surface-2": "rgb(var(--bg2) / <alpha-value>)",
        border: "rgb(var(--line) / var(--line-a))",
        muted: "rgb(var(--ink2) / <alpha-value>)",
        fg: "rgb(var(--ink) / <alpha-value>)",
        "fg-strong": "rgb(var(--ink) / <alpha-value>)",
        "accent-fg": "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        label: ["var(--font-label)", "ui-monospace", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
