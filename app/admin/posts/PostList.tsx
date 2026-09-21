"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { deletePost, reorderPosts } from "./actions";

export type AdminPostRow = {
  id: string;
  title: string;
  published: boolean;
  categories: string[];
};

export default function PostList({ items }: { items: AdminPostRow[] }) {
  const [posts, setPosts] = useState(items);
  const [, startTransition] = useTransition();
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Reorder local state, then persist the new full ordering.
  function commit(next: AdminPostRow[]) {
    setPosts(next);
    startTransition(() => reorderPosts(next.map((p) => p.id)));
  }

  function handleDrop(target: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (from === null || from === target) return;
    const next = [...posts];
    const [moved] = next.splice(from, 1);
    next.splice(target, 0, moved);
    commit(next);
  }

  return (
    <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
      {posts.map((p, i) => (
        <li
          key={p.id}
          draggable
          onDragStart={() => {
            dragIndex.current = i;
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (overIndex !== i) setOverIndex(i);
          }}
          onDragEnd={() => {
            dragIndex.current = null;
            setOverIndex(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(i);
          }}
          className={`flex items-center justify-between gap-4 px-4 py-3 ${
            overIndex === i ? "bg-accent/10" : ""
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              title="Drag to reorder"
              className="cursor-grab select-none text-muted active:cursor-grabbing"
            >
              ⠿
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/posts/${p.id}/edit`}
                  className="truncate font-medium hover:text-accent"
                >
                  {p.title}
                </Link>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    p.published
                      ? "bg-green-500/15 text-green-600"
                      : "bg-fg/10 text-muted"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted">
                {p.categories.join(", ") || "Uncategorized"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={`/admin/posts/${p.id}/edit`}
              className="text-muted hover:text-fg"
            >
              Edit
            </Link>
            <form
              action={deletePost}
              onSubmit={() =>
                setPosts((prev) => prev.filter((x) => x.id !== p.id))
              }
            >
              <input type="hidden" name="id" value={p.id} />
              <button type="submit" className="text-muted hover:text-red-500">
                Delete
              </button>
            </form>
          </div>
        </li>
      ))}
      {posts.length === 0 && (
        <li className="px-4 py-8 text-center text-sm text-muted">
          No posts yet.{" "}
          <Link href="/admin/posts/new" className="text-accent">
            Create one
          </Link>
          .
        </li>
      )}
    </ul>
  );
}
