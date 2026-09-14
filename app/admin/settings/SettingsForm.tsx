"use client";

import { useActionState } from "react";
import { updateSettings, type SettingsState } from "./actions";

export default function SettingsForm({
  initial,
}: {
  initial: { title: string; description: string; defaultView: string };
}) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateSettings,
    {},
  );

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Site title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={initial.title}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial.description}
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="defaultView" className="block text-sm font-medium">
          Default listing view
        </label>
        <select
          id="defaultView"
          name="defaultView"
          defaultValue={initial.defaultView}
          className="mt-1 rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        >
          <option value="card">Cards</option>
          <option value="list">List</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-600">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-5 py-2 font-medium text-accent-fg disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
