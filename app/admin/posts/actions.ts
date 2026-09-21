"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";
import { makeExcerpt } from "@/lib/content";

const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  contentHtml: z.string().default(""),
  published: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
  // yyyy-mm-dd from the native date input; blank falls back to createdAt.
  displayDate: z.string().default(""),
});

export type PostFormState = { error?: string };

/** Parse the yyyy-mm-dd display-date field into a UTC-midnight Date, or null. */
function parseDisplayDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseForm(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get("title"),
    contentHtml: formData.get("contentHtml") ?? "",
    published: formData.get("published") === "on",
    categoryIds: formData.getAll("categoryIds").map(String),
    displayDate: formData.get("displayDate") ?? "",
  });
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { title, contentHtml, published, categoryIds, displayDate } =
    parsed.data;

  const slug = await uniqueSlug(
    title,
    async (s) => !!(await prisma.post.findUnique({ where: { slug: s } })),
  );

  // Place new posts at the top of the manual order (order asc), preserving the
  // old newest-first default until the admin drags them.
  const min = await prisma.post.aggregate({ _min: { order: true } });
  const order = (min._min.order ?? 0) - 1;

  await prisma.post.create({
    data: {
      title,
      slug,
      contentHtml,
      excerpt: makeExcerpt(contentHtml),
      published,
      displayDate: parseDisplayDate(displayDate),
      order,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

export async function updatePost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing post id." };

  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { title, contentHtml, published, categoryIds, displayDate } =
    parsed.data;

  await prisma.$transaction([
    prisma.postCategory.deleteMany({ where: { postId: id } }),
    prisma.post.update({
      where: { id },
      data: {
        title,
        contentHtml,
        excerpt: makeExcerpt(contentHtml),
        published,
        displayDate: parseDisplayDate(displayDate),
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/posts");
  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

/**
 * Persist a new manual ordering for posts. `orderedIds` is the full list of
 * post ids in the desired top-to-bottom order; each post's `order` is set to its
 * index. Drives listing order everywhere (see lib/posts.ts).
 */
export async function reorderPosts(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.post.update({ where: { id }, data: { order: index } }),
    ),
  );
  revalidatePath("/admin/posts");
  revalidatePath("/", "layout");
}

export async function deletePost(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/", "layout");
}
