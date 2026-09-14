"use client";

import { useActionState } from "react";
import { authenticate, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    authenticate,
    {},
  );

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="text-2xl font-bold">Admin sign in</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to manage your portfolio.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-500" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-2 font-medium text-accent-fg disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
