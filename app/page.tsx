import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getHomeSections } from "@/lib/posts";
import PostListRow from "@/components/PostListRow";
import SocialLinks from "@/components/SocialLinks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [config, socialLinks, sections] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    getHomeSections(),
  ]);

  const name = config?.ownerName || config?.title || "Portfolio";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border pb-14">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-2 font-serif text-lg text-fg-strong">
            {initial}
          </span>
          {config?.availability && (
            <span className="eyebrow flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {config.availability}
            </span>
          )}
        </div>

        <h1 className="max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-fg-strong sm:text-5xl">
          {config?.description || config?.title || "Portfolio"}
        </h1>

        {config?.bio && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {config.bio}
          </p>
        )}

        <div className="mt-8">
          <SocialLinks links={socialLinks} email={config?.email} />
        </div>
      </section>

      {/* Category sections */}
      {sections.length === 0 ? (
        <p className="py-16 text-center text-muted">Nothing published yet.</p>
      ) : (
        sections.map((section) => (
          <section key={section.slug} className="border-b border-border py-12 last:border-b-0">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="eyebrow">{section.name}</h2>
              <Link
                href={`/${section.slug}`}
                className="text-sm text-muted transition-colors hover:text-accent"
              >
                All {section.total} →
              </Link>
            </div>
            <div>
              {section.posts.map((p) => (
                <PostListRow key={p.id} post={p} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
