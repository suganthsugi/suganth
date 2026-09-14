"use client";

import { useEffect, useState } from "react";
import type { PostListItem, ViewMode } from "@/lib/types";
import PostCard from "./PostCard";
import PostHoverList from "./PostHoverList";

const STORAGE_KEY = "portfolio:view";

/**
 * Client listing with a card ↔ list toggle. Initial mode comes from the site
 * config (server), then the user's stored preference wins after hydration.
 */
export default function PostListing({
  posts,
  defaultView = "card",
}: {
  posts: PostListItem[];
  defaultView?: ViewMode;
}) {
  const [view, setView] = useState<ViewMode>(defaultView);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "card" || stored === "list") setView(stored);
    } catch {
      /* ignore unavailable storage */
    }
  }, []);

  function choose(next: ViewMode) {
    setView(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line p-10 text-center text-ink2">
        Nothing here yet.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-end gap-1">
        <ToggleButton active={view === "card"} onClick={() => choose("card")}>
          Cards
        </ToggleButton>
        <ToggleButton active={view === "list"} onClick={() => choose("list")}>
          List
        </ToggleButton>
      </div>

      {view === "card" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <PostHoverList posts={posts} variant="spotlight" />
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 font-label text-[11px] tracking-wide transition-colors ${
        active
          ? "bg-bg2 text-ink"
          : "text-ink2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
