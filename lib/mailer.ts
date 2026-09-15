/**
 * Contact-form delivery. `notifyContact` is the fan-out seam: today it sends an
 * email via Resend; a WhatsApp (CallMeBot/Twilio) sender can be added here later
 * without touching the form or the server action.
 *
 * Email uses Resend's REST API directly (no SDK dependency). Requires
 * RESEND_API_KEY and CONTACT_FROM (a sender on a Resend-verified domain, e.g.
 * "Suganth <contact@send.suganth.me>"). When those are unset the send is a
 * no-op that reports `email-not-configured` — the caller still persists the
 * message, so local dev and a misconfigured prod never lose submissions.
 */

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  to: string;
};

export type SendResult = { ok: boolean; error?: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendContactEmail(p: ContactPayload): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  if (!apiKey || !from) return { ok: false, error: "email-not-configured" };

  const text = `${p.message}\n\n— ${p.name} <${p.email}>`;
  const html =
    `<p style="white-space:pre-wrap">${escapeHtml(p.message)}</p>` +
    `<p>— ${escapeHtml(p.name)} &lt;<a href="mailto:${encodeURIComponent(
      p.email,
    )}">${escapeHtml(p.email)}</a>&gt;</p>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [p.to],
        reply_to: p.email,
        subject: `New message from ${p.name} — suganth.me`,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `resend-${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `network: ${(e as Error).message}` };
  }
}

/** Deliver a contact submission through every configured channel. Currently
 * email only; returns ok if at least one channel accepted it. */
export async function notifyContact(p: ContactPayload): Promise<SendResult> {
  return sendContactEmail(p);
}
