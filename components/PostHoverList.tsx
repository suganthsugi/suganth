"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PostListItem } from "@/lib/types";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

// Decorative twinkle positions for the "card" row's hover glow.
const DOTS: [number, number, number][] = [
  [9, 26, 0],
  [22, 72, 1],
  [47, 18, 2],
  [63, 62, 0],
  [79, 32, 1],
  [91, 78, 2],
  [35, 44, 1],
];

type Peek = { post: PostListItem; x: number; y: number; tilt: number; dy: number };

/**
 * Both `Category.listStyle` display modes, admin-chosen per category (no
 * visitor-facing toggle): "card" is a full-width row with title, tag pill,
 * description and hover glow/stars; "list" is a minimal title + date row.
 * Both drive a floating cursor-following preview of the post's first content
 * image, matching the Claude Design import.
 */
export default function PostHoverList({
  posts,
  style,
}: {
  posts: PostListItem[];
  style: "card" | "list";
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: -400, y: -400 });
  const [peek, setPeek] = useState<Peek | null>(null);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    try {
      setTouch(window.matchMedia("(hover: none)").matches);
    } catch {
      /* ignore */
    }
  }, []);

  function peekSpot(r: DOMRect) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const outside = w - r.right >= 290;
    const left = outside ? r.right + 26 : Math.max(20, r.right - 340);
    const top = Math.min(Math.max(20, r.top + r.height / 2 - 104), h - 230);
    return { left: Math.round(left), top: Math.round(top) };
  }

  function handlers(p: PostListItem) {
    return {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        if (touch) return;
        const r = e.currentTarget.getBoundingClientRect();
        const spot = peekSpot(r);
        setHoverId(p.id);
        setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
        setPeek({ post: p, x: spot.left, y: spot.top, tilt: 0, dy: 14 });
      },
      onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
        if (touch) return;
        const r = e.currentTarget.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
        setPeek((prev) =>
          prev && prev.post.id === p.id
            ? { ...prev, tilt: +(nx * 3.2).toFixed(2), dy: +(ny * 34).toFixed(1) }
            : prev,
        );
      },
      onMouseLeave: () => {
        setHoverId(null);
        setPeek(null);
      },
    };
  }

  if (posts.length === 0) return null;

  return (
    <div className="flex flex-col">
      {posts.map((p) =>
        style === "card" ? (
          <Link
            key={p.id}
            href={`/posts/${p.slug}`}
            {...handlers(p)}
            className="group relative block overflow-hidden rounded-2xl border border-transparent px-4 py-5 text-ink transition-colors duration-300 hover:border-line hover:bg-bg2 sm:px-6 sm:py-7"
          >
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: hoverId === p.id ? 1 : 0,
                background: `radial-gradient(400px circle at ${mouse.x}px ${mouse.y}px, rgb(var(--glow) / var(--glow-a)), transparent 68%)`,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{ opacity: hoverId === p.id ? 1 : 0 }}
            >
              {DOTS.map(([x, y, c], i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: c === 0 ? 3 : 2,
                    height: c === 0 ? 3 : 2,
                    background: c === 1 ? "rgb(var(--accent))" : "rgb(var(--star))",
                    boxShadow: "0 0 8px rgb(var(--accent))",
                    animation: `twk ${2.2 + i * 0.2}s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h3 className="font-serif text-2xl tracking-tight sm:text-[28px]">
                    {p.title}
                  </h3>
                  {p.categories[0] && (
                    <span className="eyebrow rounded-full border border-line px-2.5 py-0.5 text-ink2">
                      {p.categories[0].name}
                    </span>
                  )}
                </div>
                {p.excerpt && (
                  <p className="max-w-xl text-[15px] leading-relaxed text-ink2">
                    {p.excerpt}
                  </p>
                )}
              </div>
              <span className="whitespace-nowrap pt-2 font-label text-[11px] text-ink2">
                {fmtDate(p.createdAt)}
              </span>
            </div>
          </Link>
        ) : (
          <Link
            key={p.id}
            href={`/posts/${p.slug}`}
            {...handlers(p)}
            className="flex items-baseline justify-between gap-6 border-b border-line px-1 py-[22px] transition-[padding,color] duration-300 last:border-b-0 hover:pl-4 hover:text-accent"
          >
            <span className="min-w-0 truncate text-[17px] leading-snug">
              {p.title}
            </span>
            <span className="shrink-0 whitespace-nowrap font-label text-[11px] text-ink2">
              {fmtDate(p.createdAt)}
            </span>
          </Link>
        ),
      )}

      {peek && (
        <div
          className="pointer-events-none fixed left-0 top-0 z-40 w-[258px] transition-transform duration-500 ease-out"
          style={{
            transform: `translate3d(${peek.x}px, ${peek.y + peek.dy}px, 0) rotate(${peek.tilt}deg)`,
          }}
        >
          <div className="overflow-hidden rounded-xl border border-line bg-bg2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
            <div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-bg">
              {peek.post.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={peek.post.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span className="eyebrow text-ink2">No image</span>
              )}
            </div>
            <p className="m-0 truncate px-3 py-2.5 font-label text-[10px] text-ink2">
              {peek.post.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
