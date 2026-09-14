import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPostsByCategory } from "@/lib/posts";
import PostListing from "@/components/PostListing";
import type { ViewMode } from "@/lib/types";

export const dynamic = "force-dynamic";

// Reserved top-level paths that are not categories. Note: "posts" is NOT
// reserved here — `/posts` (this route, category listing) and `/posts/<slug>`
// (single-post route) are different path shapes and don't collide, even
// when a category happens to be named "Posts".
const RESERVED = new Set(["admin", "api", "about", "contact"]);

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
      <section className="mb-10 max-w-[700px] pb-2 pt-4 sm:pt-8">
        <p className="eyebrow mb-5 text-accent">{category.name}</p>
        <h1 className="m-0 mb-5 text-pretty font-serif text-[clamp(38px,6vw,60px)] font-normal leading-[1.04] tracking-tight text-ink">
          {category.tagline || category.name}
        </h1>
        <p className="m-0 text-pretty text-[16px] leading-[1.7] text-ink2">
          {category.description ||
            `${posts.length} ${posts.length === 1 ? "item" : "items"}.`}
        </p>
      </section>

      <PostListing
        posts={posts}
        defaultView={(config?.defaultView as ViewMode) ?? "card"}
      />
    </div>
  );
}
