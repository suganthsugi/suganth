"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/app/contact/actions";

const inputClass =
  "w-full rounded-[11px] border border-line bg-bg2 px-[15px] py-[13px] text-[15px] text-ink outline-none transition-shadow duration-200 focus:border-accent focus:shadow-[0_0_26px_-8px_rgb(var(--glow)_/_var(--glow-a))]";

function SubmitButton({ configured }: { configured: boolean }) {
  const { pending } = useFormStatus();
  const [mag, setMag] = useState({ x: 0, y: 0 });

  function magMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = Math.max(-16, Math.min(16, (e.clientX - (r.left + r.width / 2)) * 0.4));
    const dy = Math.max(-10, Math.min(10, (e.clientY - (r.top + r.height / 2)) * 0.4));
    setMag({ x: dx, y: dy });
  }

  return (
    <div
      onMouseMove={magMove}
      onMouseLeave={() => setMag({ x: 0, y: 0 })}
      className="-m-7 inline-block max-w-full p-7"
    >
      <button
        type="submit"
        disabled={!configured || pending}
        className="inline-flex cursor-pointer select-none items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-bg2 px-7 py-[15px] font-label text-xs uppercase tracking-wide text-ink transition-[border-color,box-shadow,color] duration-200 disabled:cursor-not-allowed hover:enabled:border-accent hover:enabled:text-accent hover:enabled:shadow-[0_0_30px_-8px_rgb(var(--glow)_/_var(--glow-a))]"
        style={{
          opacity: configured ? 1 : 0.4,
          transform: `translate3d(${mag.x}px, ${mag.y}px, 0)`,
          transition:
            "transform 420ms cubic-bezier(.2,.9,.2,1), border-color 240ms ease, box-shadow 320ms ease, color 200ms ease, opacity 300ms ease",
        }}
      >
        {!configured
          ? "Contact isn't set up yet"
          : pending
            ? "Sending…"
            : "Send message"}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12h15" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

export default function ContactForm({ email }: { email?: string | null }) {
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    {},
  );
  const configured = !!email;

  if (state.ok) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-accent bg-bg2 px-6 py-[22px] shadow-[0_0_46px_-14px_rgb(var(--glow)_/_var(--glow-a))]">
        <p className="eyebrow relative m-0 mb-2.5 text-accent">Message sent</p>
        <p className="relative m-0 text-[15px] leading-relaxed text-ink">
          Thanks — it&rsquo;s on its way to me. I&rsquo;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div className="mb-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <label className="flex flex-col gap-2.5">
          <span className="eyebrow text-ink2">Your name</span>
          <input name="name" type="text" placeholder="Ada Lovelace" className={inputClass} />
        </label>
        <label className="flex flex-col gap-2.5">
          <span className="eyebrow text-ink2">Email</span>
          <input name="email" type="email" placeholder="ada@example.com" className={inputClass} />
        </label>
      </div>

      <label className="mb-[26px] flex flex-col gap-2.5">
        <span className="eyebrow text-ink2">Message</span>
        <textarea
          name="message"
          rows={6}
          placeholder="A sentence or two about the project, the timeline, and what's blocking you."
          className="w-full resize-y rounded-[11px] border border-line bg-bg2 px-[15px] py-[14px] text-[15px] leading-relaxed text-ink outline-none transition-shadow duration-200 focus:border-accent focus:shadow-[0_0_26px_-8px_rgb(var(--glow)_/_var(--glow-a))]"
        />
      </label>

      {/* Honeypot: hidden from users; bots that fill it are silently dropped. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="flex flex-col gap-5">
        <SubmitButton configured={configured} />
        <p className="m-0 font-label text-[11px] tracking-wide text-ink2">
          {!configured
            ? "No contact email is configured for this site yet — try one of the links instead."
            : state.error
              ? ""
              : "I answer everything within a couple of days."}
        </p>
        {state.error && (
          <p className="m-0 text-[13px] leading-relaxed text-red-400">{state.error}</p>
        )}
      </div>
    </form>
  );
}
