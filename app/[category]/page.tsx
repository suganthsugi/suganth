import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPostsByCategory } from "@/lib/posts";
import PostListing from "@/components/PostListing";
import type { ViewMode } from "@/lib/types";

export const dynamic = "force-dynamic";

// Reserved top-level paths that are not categories.
const RESERVED = new Set(["admin", "posts", "api"]);

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const [category, config] = await Promise.all([
    prisma.category.findUnique({ where: { slug } }),
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
  ]);
  if (!category) notFound();

  const posts = await getPostsByCategory(slug);

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        <p className="mt-1 text-muted">
          {posts.length} {posts.length === 1 ? "item" : "items"}
        </p>
      </section>

      <PostListing
        posts={posts}
        defaultView={(config?.defaultView as ViewMode) ?? "card"}
      />
    </div>
  );
}
