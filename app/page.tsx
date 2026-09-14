import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getHomeSections } from "@/lib/posts";
import { splitHighlight } from "@/lib/content";
import PostSection from "@/components/PostSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [config, sections] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
    getHomeSections(),
  ]);

  const name = config?.ownerName || config?.title || "Portfolio";
  const initial = name.trim().charAt(0).toUpperCase();
  const headline = config?.description || config?.title || "Portfolio";
  const highlight = splitHighlight(headline, config?.headlineHighlight);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-[780px] pb-14 pt-4 sm:pt-8">
        <div className="mb-7 flex items-center gap-3.5">
          <span
            title={name}
            className="relative grid h-[46px] w-[46px] shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-bg2"
            style={{ boxShadow: "0 0 0 4px rgb(var(--halo) / var(--halo-a))" }}
          >
            {config?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.avatarUrl}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="font-label text-[13px] tracking-wide text-ink2">
                {initial}
              </span>
            )}
          </span>
          {config?.availability && (
            <p className="eyebrow m-0 flex items-center gap-2.5 whitespace-nowrap text-ink2">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                style={{ boxShadow: "0 0 10px rgb(var(--accent))", animation: "twk 2.8s ease-in-out infinite" }}
              />
              {config.availability}
            </p>
          )}
        </div>

        <h1 className="m-0 mb-6 max-w-3xl text-pretty font-serif text-[clamp(34px,4.6vw,54px)] font-normal leading-[1.08] tracking-tight text-ink">
          {highlight ? (
            <>
              {highlight.before}
              <em className="italic text-accent">{highlight.match}</em>
              {highlight.after}
            </>
          ) : (
            headline
          )}
        </h1>

        {config?.bio && (
          <p className="m-0 max-w-xl text-lg leading-relaxed text-ink2">
            {config.bio}
          </p>
        )}
      </section>

      {/* Category sections */}
      {sections.length === 0 ? (
        <p className="py-16 text-center text-ink2">Nothing published yet.</p>
      ) : (
        sections.map((section, i) => (
          <section key={section.slug}>
            {i > 0 && <div className="h-px bg-line" />}
            <div className="pb-2 pt-12 sm:pt-[72px]">
              <div className="mb-8 flex items-baseline justify-between">
                <h2 className="eyebrow m-0 text-ink2">{section.name}</h2>
                <Link
                  href={`/${section.slug}`}
                  className="font-label text-[11px] tracking-wide text-ink2 transition-colors hover:text-accent"
                >
                  All {section.total} →
                </Link>
              </div>
              <PostSection posts={section.posts} listStyle={section.listStyle} />
            </div>
          </section>
        ))
      )}
    </div>
  );
}
