"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";

const nameSchema = z.string().trim().min(1, "Name is required").max(60);

export type CategoryActionState = { error?: string; ok?: boolean };

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const name = parsed.data;

  const existingName = await prisma.category.findUnique({ where: { name } });
  if (existingName) return { error: "A category with that name exists." };

  const slug = await uniqueSlug(
    slugify(name),
    async (s) => !!(await prisma.category.findUnique({ where: { slug: s } })),
  );

  const max = await prisma.category.aggregate({ _max: { order: true } });
  await prisma.category.create({
    data: { name, slug, order: (max._max.order ?? -1) + 1 },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  // PostCategory rows cascade-delete; posts themselves are kept.
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}
