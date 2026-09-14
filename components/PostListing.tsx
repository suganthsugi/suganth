"use client";

import { useEffect, useState } from "react";
import type { PostListItem, ViewMode } from "@/lib/types";
import PostCard from "./PostCard";
import PostListRow from "./PostListRow";

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
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-muted">
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
        <div className="border-t border-border">
          {posts.map((p) => (
            <PostListRow key={p.id} post={p} />
          ))}
        </div>
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
      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-accent text-accent-fg"
          : "text-muted hover:bg-surface-2 hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
