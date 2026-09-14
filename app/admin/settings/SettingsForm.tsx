"use client";

import { useActionState } from "react";
import { updateSettings, type SettingsState } from "./actions";

export default function SettingsForm({
  initial,
}: {
  initial: {
    title: string;
    description: string;
    defaultView: string;
    ownerName: string;
    email: string;
    location: string;
    bio: string;
    availability: string;
  };
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
          Tagline <span className="text-muted">(hero headline)</span>
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial.description}
          rows={2}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio <span className="text-muted">(paragraph under the headline)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={initial.bio}
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="availability" className="block text-sm font-medium">
          Availability badge{" "}
          <span className="text-muted">(e.g. “Available for work” — blank to hide)</span>
        </label>
        <input
          id="availability"
          name="availability"
          defaultValue={initial.availability}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium">
            Your name
          </label>
          <input
            id="ownerName"
            name="ownerName"
            defaultValue={initial.ownerName}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={initial.location}
            placeholder="City, Country"
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Contact email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={initial.email}
          placeholder="you@example.com"
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
