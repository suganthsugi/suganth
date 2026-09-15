"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { allow } from "@/lib/rate-limit";
import { notifyContact } from "@/lib/mailer";

export type ContactState = { ok?: boolean; error?: string };

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(160),
  message: z.string().trim().min(1, "Please write a message").max(5000),
});

/** Handle a public contact-form submission: drop bots, rate-limit, validate,
 * persist, then deliver via notifyContact. The message is always saved when
 * valid — delivery failures don't lose it (and aren't shown as a hard error). */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: real users never fill this hidden field. Pretend success.
  if ((formData.get("company") as string)?.trim()) return { ok: true };

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return { error: "Too many messages just now — try again in a little while." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { name, email, message } = parsed.data;

  const config = await prisma.siteConfig.findUnique({
    where: { id: "singleton" },
    select: { email: true },
  });
  if (!config?.email) {
    return { error: "Contact isn't set up yet — try one of the links instead." };
  }

  let record;
  try {
    record = await prisma.contactMessage.create({
      data: { name, email, message },
    });
  } catch {
    return { error: "Something went wrong saving your message. Please try again." };
  }

  const result = await notifyContact({ name, email, message, to: config.email });
  if (result.ok) {
    await prisma.contactMessage
      .update({ where: { id: record.id }, data: { delivered: true } })
      .catch(() => {});
  } else {
    // Saved but not delivered (e.g. email not configured / provider error).
    // Don't fail the visitor — the message is stored and visible in admin.
    console.error("[contact] delivery failed:", result.error);
  }

  return { ok: true };
}
