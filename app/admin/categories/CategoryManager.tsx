"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCategory,
  deleteCategory,
  type CategoryActionState,
} from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
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

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-3">
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
          </li>
        ))}
        {categories.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted">
            No categories yet.
          </li>
        )}
      </ul>
    </div>
  );
}
