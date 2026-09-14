"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createSocialLink,
  deleteSocialLink,
  type LinkState,
} from "./actions";

type Link = {
  id: string;
  label: string;
  url: string;
  platform: string;
};

const PLATFORMS = [
  "github",
  "linkedin",
  "twitter",
  "instagram",
  "youtube",
  "website",
  "email",
  "link",
];

export default function SocialLinksManager({ links }: { links: Link[] }) {
  const [state, formAction, pending] = useActionState<LinkState, FormData>(
    createSocialLink,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div>
      <form
        ref={formRef}
        action={formAction}
        className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto_auto]"
      >
        <input
          name="label"
          placeholder="Label (e.g. GitHub)"
          className="rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
        <input
          name="url"
          placeholder="https://… (or mailto:)"
          className="rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
        <select
          name="platform"
          defaultValue="link"
          className="rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 font-medium text-accent-fg disabled:opacity-60"
        >
          Add
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-500">{state.error}</p>}

      <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
        {links.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <span className="font-medium">{l.label}</span>
              <span className="ml-2 text-xs text-muted">({l.platform})</span>
              <p className="truncate text-xs text-muted">{l.url}</p>
            </div>
            <form action={deleteSocialLink}>
              <input type="hidden" name="id" value={l.id} />
              <button
                type="submit"
                className="text-sm text-muted hover:text-red-500"
              >
                Remove
              </button>
            </form>
          </li>
        ))}
        {links.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted">
            No links yet. Add GitHub, LinkedIn, and anything else.
          </li>
        )}
      </ul>
    </div>
  );
}
