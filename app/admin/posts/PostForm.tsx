"use client";

import { useActionState, useState } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import type { PostFormState } from "./actions";

type Category = { id: string; name: string };

export type PostFormValues = {
  id?: string;
  title: string;
  contentHtml: string;
  published: boolean;
  categoryIds: string[];
  // yyyy-mm-dd for the native date input.
  displayDate: string;
};

export default function PostForm({
  action,
  categories,
  initial,
  submitLabel,
}: {
  action: (prev: PostFormState, formData: FormData) => Promise<PostFormState>;
  categories: Category[];
  initial: PostFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<PostFormState, FormData>(
    action,
    {},
  );
  const [contentHtml, setContentHtml] = useState(initial.contentHtml);

  return (
    <form action={formAction} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {/* Editor HTML is synced into this hidden field for submission. */}
      <input type="hidden" name="contentHtml" value={contentHtml} />

      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={initial.title}
          required
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-lg outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <RichTextEditor value={contentHtml} onChange={setContentHtml} />
        <p className="mt-1 text-xs text-muted">
          The first image in the content becomes the listing hover preview.
        </p>
      </div>

      <div>
        <label htmlFor="displayDate" className="block text-sm font-medium">
          Display date
        </label>
        <input
          id="displayDate"
          name="displayDate"
          type="date"
          defaultValue={initial.displayDate}
          className="mt-1 rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">
          The date shown on the post everywhere. Defaults to today; set an
          earlier date to reflect when the content is really from. Doesn&apos;t
          affect ordering.
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Categories</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/10"
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={c.id}
                defaultChecked={initial.categoryIds.includes(c.id)}
                className="accent-accent"
              />
              {c.name}
            </label>
          ))}
          {categories.length === 0 && (
            <span className="text-sm text-muted">
              No categories yet — create some first.
            </span>
          )}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial.published}
          className="accent-accent"
        />
        Published (visible on the public site)
      </label>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-5 py-2 font-medium text-accent-fg disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
