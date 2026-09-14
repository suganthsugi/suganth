"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(300).default(""),
  headlineHighlight: z.string().trim().max(160).optional(),
  avatarUrl: z.string().trim().max(400000).optional(),
  ownerName: z.string().trim().max(120).optional(),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(160)
    .optional()
    .or(z.literal("")),
  location: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(600).optional(),
  availability: z.string().trim().max(60).optional(),
  currentRole: z.string().trim().max(120).optional(),
  tools: z.string().trim().max(300).optional(),
  aboutHtml: z.string().trim().max(20000).optional(),
});

export type SettingsState = { error?: string; ok?: boolean };

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    headlineHighlight: formData.get("headlineHighlight") ?? "",
    avatarUrl: formData.get("avatarUrl") ?? "",
    ownerName: formData.get("ownerName") ?? "",
    email: formData.get("email") ?? "",
    location: formData.get("location") ?? "",
    bio: formData.get("bio") ?? "",
    availability: formData.get("availability") ?? "",
    currentRole: formData.get("currentRole") ?? "",
    tools: formData.get("tools") ?? "",
    aboutHtml: formData.get("aboutHtml") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = {
    title: parsed.data.title,
    description: parsed.data.description,
    headlineHighlight: parsed.data.headlineHighlight || null,
    avatarUrl: parsed.data.avatarUrl || null,
    ownerName: parsed.data.ownerName || null,
    email: parsed.data.email || null,
    location: parsed.data.location || null,
    bio: parsed.data.bio || null,
    availability: parsed.data.availability || null,
    currentRole: parsed.data.currentRole || null,
    tools: parsed.data.tools || null,
    aboutHtml: parsed.data.aboutHtml || null,
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
