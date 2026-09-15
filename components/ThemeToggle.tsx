"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Resolve the currently-applied theme from the DOM. Default is dark. */
function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const explicit = document.documentElement.dataset.theme;
  return explicit === "light" ? "light" : "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(currentTheme());

    // Follow the OS theme live, but only while the visitor hasn't made an
    // explicit choice (nothing stored). Once they toggle, that choice wins.
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("theme");
      } catch {
        /* ignore */
      }
      if (stored === "light" || stored === "dark") return;
      const next: Theme = e.matches ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      setTheme(next);
      window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
    };
    mq.addEventListener("change", onSystemChange);
    return () => mq.removeEventListener("change", onSystemChange);
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
    setTheme(next);
    // Let other client components (e.g. the TinyMCE editor) react.
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle theme"
      className="ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink2 transition-colors duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_18px_rgb(var(--glow)_/_var(--glow-a))]"
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch. */}
      {mounted && isDark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
        </svg>
      )}
    </button>
  );
}
