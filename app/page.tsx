import { prisma } from "@/lib/prisma";
import { getPublishedPosts } from "@/lib/posts";
import PostListing from "@/components/PostListing";
import SocialLinks from "@/components/SocialLinks";
import type { ViewMode } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [config, socialLinks, posts] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    getPublishedPosts(),
  ]);

  return (
    <div>
      <section className="mb-12 border-b border-border pb-10">
        {config?.ownerName && (
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {config.ownerName}
          </p>
        )}
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          {config?.title ?? "Portfolio"}
        </h1>
        {config?.description && (
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {config.description}
          </p>
        )}
        <div className="mt-6">
          <SocialLinks links={socialLinks} email={config?.email} />
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-lg font-semibold">Latest</h2>
        <PostListing
          posts={posts}
          defaultView={(config?.defaultView as ViewMode) ?? "card"}
        />
      </section>
    </div>
  );
}
