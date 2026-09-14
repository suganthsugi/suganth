"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(300).default(""),
  defaultView: z.enum(["card", "list"]),
  ownerName: z.string().trim().max(120).optional(),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(160)
    .optional()
    .or(z.literal("")),
  location: z.string().trim().max(120).optional(),
});

export type SettingsState = { error?: string; ok?: boolean };

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    defaultView: formData.get("defaultView"),
    ownerName: formData.get("ownerName") ?? "",
    email: formData.get("email") ?? "",
    location: formData.get("location") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = {
    title: parsed.data.title,
    description: parsed.data.description,
    defaultView: parsed.data.defaultView,
    ownerName: parsed.data.ownerName || null,
    email: parsed.data.email || null,
    location: parsed.data.location || null,
  };

  await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

// --- Social / personal links CRUD ---

const KNOWN_PLATFORMS = [
  "github",
  "linkedin",
  "twitter",
  "instagram",
  "youtube",
  "website",
  "email",
  "link",
] as const;

const linkSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(40),
  url: z.string().trim().min(1, "URL is required").max(400),
  platform: z.enum(KNOWN_PLATFORMS).default("link"),
});

export type LinkState = { error?: string; ok?: boolean };

export async function createSocialLink(
  _prev: LinkState,
  formData: FormData,
): Promise<LinkState> {
  const parsed = linkSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
    platform: formData.get("platform"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const max = await prisma.socialLink.aggregate({ _max: { order: true } });
  await prisma.socialLink.create({
    data: { ...parsed.data, order: (max._max.order ?? -1) + 1 },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteSocialLink(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.socialLink.delete({ where: { id } });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
