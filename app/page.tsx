import { prisma } from "@/lib/prisma";
import { getPublishedPosts } from "@/lib/posts";
import PostListing from "@/components/PostListing";
import type { ViewMode } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [config, posts] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
    getPublishedPosts(),
  ]);

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          {config?.title ?? "Portfolio"}
        </h1>
        {config?.description && (
          <p className="mt-2 max-w-2xl text-muted">{config.description}</p>
        )}
      </section>

      <PostListing
        posts={posts}
        defaultView={(config?.defaultView as ViewMode) ?? "card"}
      />
    </div>
  );
}
