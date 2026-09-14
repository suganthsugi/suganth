"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(300).default(""),
  defaultView: z.enum(["card", "list"]),
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
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
