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
});

export type PostFormState = { error?: string };

function parseForm(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get("title"),
    contentHtml: formData.get("contentHtml") ?? "",
    published: formData.get("published") === "on",
    categoryIds: formData.getAll("categoryIds").map(String),
  });
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { title, contentHtml, published, categoryIds } = parsed.data;

  const slug = await uniqueSlug(
    title,
    async (s) => !!(await prisma.post.findUnique({ where: { slug: s } })),
  );

  await prisma.post.create({
    data: {
      title,
      slug,
      contentHtml,
      excerpt: makeExcerpt(contentHtml),
      published,
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
  const { title, contentHtml, published, categoryIds } = parsed.data;

  await prisma.$transaction([
    prisma.postCategory.deleteMany({ where: { postId: id } }),
    prisma.post.update({
      where: { id },
      data: {
        title,
        contentHtml,
        excerpt: makeExcerpt(contentHtml),
        published,
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

export async function deletePost(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/", "layout");
}
