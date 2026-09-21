"use client";

import { useActionState, useRef, useState } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { updateSettings, type SettingsState } from "./actions";

/** Downscale an image client-side and resolve a compact JPEG data: URI —
 * keeps the avatar small enough to store as a plain SiteConfig text field. */
function fileToAvatarDataUrl(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function SettingsForm({
  initial,
}: {
  initial: {
    title: string;
    description: string;
    headlineHighlight: string;
    avatarUrl: string;
    resumeUrl: string;
    ownerName: string;
    email: string;
    location: string;
    bio: string;
    availability: string;
    currentRole: string;
    tools: string;
    aboutHtml: string;
  };
}) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateSettings,
    {},
  );
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [aboutHtml, setAboutHtml] = useState(initial.aboutHtml);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeUrl, setResumeUrl] = useState(initial.resumeUrl);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarError(null);
      setAvatarUrl(await fileToAvatarDataUrl(file));
    } catch {
      setAvatarError("Couldn't read that image — try a different file.");
    }
  }

  // Upload the PDF to /api/uploads (admin-only) and keep the returned URL.
  async function onResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeError(null);
    setResumeUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = (await res.json()) as { location?: string; error?: string };
      if (!res.ok || !data.location) {
        throw new Error(data.error || "Upload failed.");
      }
      setResumeUrl(data.location);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setResumeUploading(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  }

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
        <span className="block text-sm font-medium">Profile picture</span>
        <div className="mt-2 flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-2">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-muted">None</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-fg"
            >
              Upload image
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="text-sm text-muted hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="hidden"
          />
        </div>
        {avatarError && <p className="mt-1 text-sm text-red-500">{avatarError}</p>}
        <input type="hidden" name="avatarUrl" value={avatarUrl} />
      </div>

      <div>
        <span className="block text-sm font-medium">
          Resume / CV <span className="text-muted">(PDF)</span>
        </span>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            disabled={resumeUploading}
            className="rounded-md border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-fg disabled:opacity-60"
          >
            {resumeUploading
              ? "Uploading…"
              : resumeUrl
                ? "Replace PDF"
                : "Upload PDF"}
          </button>
          {resumeUrl && (
            <>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline"
              >
                View current
              </a>
              <button
                type="button"
                onClick={() => setResumeUrl("")}
                className="text-sm text-muted hover:text-red-500"
              >
                Remove
              </button>
            </>
          )}
          <input
            ref={resumeInputRef}
            type="file"
            accept="application/pdf"
            onChange={onResumeChange}
            className="hidden"
          />
        </div>
        <p className="mt-1 text-xs text-muted">
          Shown as a “Resume” button on the About page. Max 10 MB.
        </p>
        {resumeError && <p className="mt-1 text-sm text-red-500">{resumeError}</p>}
        <input type="hidden" name="resumeUrl" value={resumeUrl} />
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
        <label htmlFor="headlineHighlight" className="block text-sm font-medium">
          Highlight phrase{" "}
          <span className="text-muted">(a phrase within the tagline to accent — blank for none)</span>
        </label>
        <input
          id="headlineHighlight"
          name="headlineHighlight"
          defaultValue={initial.headlineHighlight}
          placeholder="don't wake you up"
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
          Small notice badge{" "}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currentRole" className="block text-sm font-medium">
            About: current role
          </label>
          <input
            id="currentRole"
            name="currentRole"
            defaultValue={initial.currentRole}
            placeholder="Senior engineer, platform team"
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="tools" className="block text-sm font-medium">
            About: tools
          </label>
          <input
            id="tools"
            name="tools"
            defaultValue={initial.tools}
            placeholder="Go, TypeScript, Postgres"
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium mb-1">
          About page body{" "}
          <span className="text-muted">(blank falls back to your bio)</span>
        </span>
        {/* Editor HTML is synced into this hidden field for submission. */}
        <input type="hidden" name="aboutHtml" value={aboutHtml} />
        <RichTextEditor value={aboutHtml} onChange={setAboutHtml} />
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
