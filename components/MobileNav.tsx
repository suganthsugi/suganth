"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type NavLink = { href: string; label: string };

/**
 * Hamburger menu for narrow viewports — the full nav (categories + About +
 * Contact) wraps under the logo on phones otherwise. Hidden at `sm` and up,
 * where the inline nav in the header takes over.
 */
export default function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="relative grid h-11 w-11 place-items-center rounded-full border border-line text-ink2 transition-colors duration-200 hover:border-accent hover:text-accent"
      >
        <span className="relative block h-[14px] w-[16px]">
          <span
            className="absolute left-0 right-0 h-[1.5px] bg-current transition-transform duration-200"
            style={{
              top: open ? "6px" : "0px",
              transform: open ? "rotate(45deg)" : "none",
            }}
          />
          <span
            className="absolute left-0 right-0 top-[6px] h-[1.5px] bg-current transition-opacity duration-200"
            style={{ opacity: open ? 0 : 1 }}
          />
          <span
            className="absolute left-0 right-0 h-[1.5px] bg-current transition-transform duration-200"
            style={{
              top: open ? "6px" : "12px",
              transform: open ? "rotate(-45deg)" : "none",
            }}
          />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-bg/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        className="fixed left-[clamp(18px,5vw,32px)] right-[clamp(18px,5vw,32px)] top-[88px] z-40 flex flex-col gap-1 overflow-hidden rounded-2xl border border-line bg-bg2 p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] transition-[grid-template-rows,opacity] duration-200"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: open ? "auto" : "none",
          visibility: open ? "visible" : "hidden",
        }}
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="min-h-11 rounded-xl px-3.5 py-2.5 font-label text-sm tracking-wide text-ink2 transition-colors hover:bg-bg hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
