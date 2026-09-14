"use client";

import { useRef, useState } from "react";

export default function ContactForm({ email }: { email?: string | null }) {
  const [name, setName] = useState("");
  const [emailField, setEmailField] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [mag, setMag] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLDivElement>(null);

  const ready = [name, emailField, message].every((v) => v.trim().length > 1);

  function magMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = Math.max(-16, Math.min(16, (e.clientX - cx) * 0.4));
    const dy = Math.max(-10, Math.min(10, (e.clientY - cy) * 0.4));
    setMag({ x: dx, y: dy });
  }

  function fire(e: React.MouseEvent) {
    e.preventDefault();
    if (!ready) return;
    if (email) {
      const subject = encodeURIComponent(`Message from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${emailField})`);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
    setSent(true);
  }

  return (
    <div>
      <div className="mb-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <label className="flex flex-col gap-2.5">
          <span className="eyebrow text-ink2">Your name</span>
          <input
            type="text"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[11px] border border-line bg-bg2 px-[15px] py-[13px] text-[15px] text-ink outline-none transition-shadow duration-200 focus:border-accent focus:shadow-[0_0_26px_-8px_rgb(var(--glow)_/_var(--glow-a))]"
          />
        </label>
        <label className="flex flex-col gap-2.5">
          <span className="eyebrow text-ink2">Email</span>
          <input
            type="email"
            placeholder="ada@example.com"
            value={emailField}
            onChange={(e) => setEmailField(e.target.value)}
            className="w-full rounded-[11px] border border-line bg-bg2 px-[15px] py-[13px] text-[15px] text-ink outline-none transition-shadow duration-200 focus:border-accent focus:shadow-[0_0_26px_-8px_rgb(var(--glow)_/_var(--glow-a))]"
          />
        </label>
      </div>

      <label className="mb-[26px] flex flex-col gap-2.5">
        <span className="eyebrow text-ink2">Message</span>
        <textarea
          rows={6}
          placeholder="A sentence or two about the project, the timeline, and what's blocking you."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-y rounded-[11px] border border-line bg-bg2 px-[15px] py-[14px] text-[15px] leading-relaxed text-ink outline-none transition-shadow duration-200 focus:border-accent focus:shadow-[0_0_26px_-8px_rgb(var(--glow)_/_var(--glow-a))]"
        />
      </label>

      <div className="flex flex-col gap-5">
        {!sent ? (
          <div
            ref={btnRef}
            onMouseMove={magMove}
            onMouseLeave={() => setMag({ x: 0, y: 0 })}
            className="-m-7 inline-block max-w-full p-7"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={fire}
              onKeyDown={(e) => e.key === "Enter" && fire(e as unknown as React.MouseEvent)}
              className="inline-flex cursor-pointer select-none items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-bg2 px-7 py-[15px] font-label text-xs uppercase tracking-wide text-ink transition-[border-color,box-shadow,color] duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_30px_-8px_rgb(var(--glow)_/_var(--glow-a))]"
              style={{
                opacity: ready ? 1 : 0.4,
                transform: `translate3d(${mag.x}px, ${mag.y}px, 0)`,
                transition: "transform 420ms cubic-bezier(.2,.9,.2,1), border-color 240ms ease, box-shadow 320ms ease, color 200ms ease, opacity 300ms ease",
              }}
            >
              {ready ? "Send message" : "Fill all three"}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12h15" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-accent bg-bg2 px-6 py-[22px] shadow-[0_0_46px_-14px_rgb(var(--glow)_/_var(--glow-a))]">
            <p className="eyebrow relative m-0 mb-2.5 text-accent">Message sent</p>
            <p className="relative m-0 mb-3.5 text-[15px] leading-relaxed text-ink">
              Thanks — I&rsquo;ll reply within a couple of days.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setName("");
                setEmailField("");
                setMessage("");
              }}
              className="relative font-label text-[11px] tracking-wide text-accent"
            >
              Send another
            </button>
          </div>
        )}

        {!sent && (
          <p className="m-0 font-label text-[11px] tracking-wide text-ink2">
            {ready ? "" : "Fill in all three fields to arm the send."}
          </p>
        )}
      </div>
    </div>
  );
}
