"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wraps rendered post content and turns any <img> click into a full-screen
 * zoom. Uses event delegation so it works with images injected via
 * dangerouslySetInnerHTML (post body) as well as the hero image. Images inside
 * a link are left alone so the link still navigates.
 */
export default function Lightbox({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(
    null,
  );

  const close = useCallback(() => setZoomed(null), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName !== "IMG") return;
      // Don't hijack images that are themselves links.
      if (target.closest("a")) return;
      const img = target as HTMLImageElement;
      if (!img.currentSrc && !img.src) return;
      setZoomed({ src: img.currentSrc || img.src, alt: img.alt });
    }

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!zoomed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    // Prevent the page behind the overlay from scrolling.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomed, close]);

  return (
    <>
      <div ref={containerRef} className="zoomable">
        {children}
      </div>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed image"
          onClick={close}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoomed.src}
            alt={zoomed.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-default rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
