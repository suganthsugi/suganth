import { prisma } from "@/lib/prisma";
import { extractFirstImage, makeExcerpt } from "@/lib/content";
import type { PostListItem } from "@/lib/types";

type PostWithCategories = {
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  excerpt: string | null;
  createdAt: Date;
  categories: { category: { name: string; slug: string } }[];
};

/** Map a Prisma post (with joined categories) to the serializable list shape. */
export function toListItem(post: PostWithCategories): PostListItem {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || makeExcerpt(post.contentHtml),
    image: extractFirstImage(post.contentHtml),
    categories: post.categories.map((pc) => pc.category),
    createdAt: post.createdAt.toISOString(),
  };
}

const listInclude = {
  categories: { include: { category: true } },
} as const;

/** All published posts, newest first. */
export async function getPublishedPosts(): Promise<PostListItem[]> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: listInclude,
    orderBy: { createdAt: "desc" },
  });
  return posts.map(toListItem);
}

/** Published posts within a category slug. */
export async function getPostsByCategory(slug: string): Promise<PostListItem[]> {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      categories: { some: { category: { slug } } },
    },
    include: listInclude,
    orderBy: { createdAt: "desc" },
  });
  return posts.map(toListItem);
}

export type HomeSection = {
  name: string;
  slug: string;
  total: number;
  listStyle: "card" | "list";
  posts: PostListItem[];
};

/**
 * One section per category that has published posts, each with its most recent
 * few items and a total count — powers the home page's "Selected …" sections.
 */
export async function getHomeSections(perSection = 4): Promise<HomeSection[]> {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      posts: {
        where: { post: { published: true } },
        include: { post: { include: listInclude } },
        orderBy: { post: { createdAt: "desc" } },
      },
    },
  });

  return categories
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      total: c.posts.length,
      listStyle: c.listStyle === "list" ? ("list" as const) : ("card" as const),
      posts: c.posts.slice(0, perSection).map((pc) => toListItem(pc.post)),
    }))
    .filter((s) => s.total > 0);
}
