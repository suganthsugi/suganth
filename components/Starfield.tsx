"use client";

import { useEffect, useRef, useState } from "react";

type Star = {
  x: number;
  y: number;
  d: number;
  accent: boolean;
  b: number;
  dur: number;
  del: number;
};

/** Deterministic PRNG so the field looks the same on every load. */
function makeStars(count: number): Star[] {
  let seed = 20260913;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    const r = rnd();
    out.push({
      x: +(rnd() * 98 + 1).toFixed(2),
      y: +(rnd() * 97 + 1.5).toFixed(2),
      d: r > 0.86 ? 3 : 2,
      accent: r > 0.7,
      b: r > 0.86 ? 10 : 7,
      dur: +(2.2 + rnd() * 2.4).toFixed(2),
      del: +(rnd() * 2.4).toFixed(2),
    });
  }
  return out;
}

const STARS = makeStars(64);

/**
 * Fixed, whole-page ambient glow + cursor-tracked starfield spotlight, matching
 * the Claude Design "Portfolio" background. Pointer-events: none throughout so
 * it never blocks interaction.
 */
export default function Starfield() {
  const [pos, setPos] = useState({ x: -600, y: -600, on: false });
  const [touch, setTouch] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    try {
      setTouch(window.matchMedia("(hover: none)").matches);
    } catch {
      /* ignore */
    }

    function onMove(e: PointerEvent) {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        setPos({ x: e.clientX, y: e.clientY, on: true });
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const cx = touch ? -900 : pos.x;
  const cy = touch ? -900 : pos.y;
  const opacity = touch ? 0.5 : pos.on ? 1 : 0;
  const mask = touch
    ? "none"
    : `radial-gradient(260px circle at ${cx}px ${cy}px, #000 10%, transparent 72%)`;

  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1100px 620px at 78% -12%, rgb(var(--ambient) / var(--ambient-a)), transparent 70%)",
          opacity: 0.55,
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(560px circle at ${cx}px ${cy}px, rgb(var(--halo) / var(--halo-a)), transparent 68%)`,
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity,
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.d,
              height: s.d,
              background: s.accent ? "rgb(var(--accent))" : "rgb(var(--star))",
              boxShadow: `0 0 ${s.b}px rgb(var(--accent))`,
              animation: `twk ${s.dur}s ease-in-out ${s.del}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
