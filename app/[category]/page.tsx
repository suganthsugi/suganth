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
      <section className="mb-10 border-b border-border pb-8">
        <p className="eyebrow mb-3">Category</p>
        <h1 className="font-serif text-4xl tracking-tight text-fg-strong">
          {category.name}
        </h1>
        <p className="mt-2 text-muted">
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
