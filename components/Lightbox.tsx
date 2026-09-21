"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Item = { src: string; alt: string };

/**
 * Wraps rendered post content and turns any <img> click into a polished
 * full-screen zoom with fade/scale animation, an ambient accent glow, a caption
 * bar, and prev/next navigation across all images in the post. Uses event
 * delegation so it works with images injected via dangerouslySetInnerHTML (post
 * body) as well as the hero image. Images inside a link keep their link.
 */
export default function Lightbox({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  // Drives the enter/leave transition; separate from `index` so we can animate
  // the overlay out before unmounting it.
  const [shown, setShown] = useState(false);

  const open = index !== null;
  const current = open ? items[index] : null;
  const hasMany = items.length > 1;

  const close = useCallback(() => {
    setShown(false);
    // Match the CSS transition duration before unmounting.
    window.setTimeout(() => setIndex(null), 220);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) =>
        i === null ? i : (i + dir + items.length) % items.length,
      );
    },
    [items.length],
  );

  // Delegated click: collect every non-linked image once, open at the clicked one.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName !== "IMG" || target.closest("a")) return;
      const all = Array.from(
        el!.querySelectorAll<HTMLImageElement>("img"),
      ).filter((img) => !img.closest("a") && (img.currentSrc || img.src));
      const clicked = target as HTMLImageElement;
      const at = all.indexOf(clicked);
      if (at === -1) return;
      setItems(all.map((img) => ({ src: img.currentSrc || img.src, alt: img.alt })));
      setIndex(at);
    }

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  // Trigger the enter transition on the next frame after mount.
  useEffect(() => {
    if (index === null) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [index]);

  // Keyboard controls + scroll lock while open.
  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, close, step]);

  return (
    <>
      <div ref={containerRef} className="zoomable">
        {children}
      </div>

      {open && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed image"
          onClick={close}
          className={`lightbox-backdrop fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-8 ${
            shown ? "is-shown" : ""
          }`}
        >
          {/* Top bar: counter + close */}
          <div
            className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-label text-[11px] tracking-wide text-white/60">
              {hasMany ? `${index! + 1} / ${items.length}` : ""}
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl leading-none text-white/90 backdrop-blur transition-colors hover:bg-white/20"
            >
              ×
            </button>
          </div>

          {/* Prev / next */}
          {hasMany && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white/90 backdrop-blur transition-colors hover:bg-white/20 sm:left-5"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white/90 backdrop-blur transition-colors hover:bg-white/20 sm:right-5"
              >
                ›
              </button>
            </>
          )}

          {/* Image */}
          <figure
            className="lightbox-figure m-0 flex max-h-full max-w-full flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* key forces the fade between images when navigating */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.src}
              src={current.src}
              alt={current.alt}
              className="lightbox-img max-h-[82vh] max-w-full rounded-xl border border-white/10 object-contain shadow-2xl"
            />
            {current.alt && (
              <figcaption className="max-w-[80ch] text-center font-label text-[12px] tracking-wide text-white/60">
                {current.alt}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
