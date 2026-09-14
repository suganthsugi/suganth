"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCategory,
  deleteCategory,
  updateCategoryCopy,
  type CategoryActionState,
} from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  listStyle: string;
  _count: { posts: number };
};

export default function CategoryManager({
  categories,
}: {
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<
    CategoryActionState,
    FormData
  >(createCategory, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div>
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-wrap items-start gap-2"
      >
        <input
          name="name"
          placeholder="New category name"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 font-medium text-accent-fg disabled:opacity-60"
        >
          Add
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-500">{state.error}</p>}

      <ul className="mt-6 space-y-3">
        {categories.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-border px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-medium">{c.name}</span>
                <span className="ml-2 text-xs text-muted">
                  /{c.slug} · {c._count.posts}{" "}
                  {c._count.posts === 1 ? "post" : "posts"}
                </span>
              </div>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  className="text-sm text-muted hover:text-red-500"
                >
                  Remove
                </button>
              </form>
            </div>

            <form
              action={updateCategoryCopy}
              className="mt-3 grid gap-2 sm:grid-cols-[1fr_1.4fr_auto_auto] sm:items-start"
            >
              <input type="hidden" name="id" value={c.id} />
              <input
                name="tagline"
                defaultValue={c.tagline ?? ""}
                placeholder={`Headline (defaults to "${c.name}")`}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                name="description"
                defaultValue={c.description ?? ""}
                placeholder="Description shown under the headline"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <select
                // React re-applies a <select>'s `defaultValue` on every
                // re-render (unlike plain inputs), snapping it back to
                // whatever it was at first mount. Keying on the current
                // value forces a remount after each save so it reflects
                // what was actually saved instead of the stale original.
                key={c.listStyle}
                name="listStyle"
                defaultValue={c.listStyle}
                title="How this category's posts are displayed on its listing page and in its home page section"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="card">Cards</option>
                <option value="list">List</option>
              </select>
              <button
                type="submit"
                className="rounded-md border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-fg"
              >
                Save
              </button>
            </form>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            No categories yet.
          </li>
        )}
      </ul>
    </div>
  );
}
