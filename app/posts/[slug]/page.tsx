import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { extractFirstImage, readingMinutes, removeFirstImage } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { categories: { include: { category: true } } },
  });

  if (!post || !post.published) notFound();

  const primary = post.categories[0]?.category;
  const date = (post.displayDate ?? post.createdAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      year: "numeric",
    },
  );
  const image = extractFirstImage(post.contentHtml);
  // The first image is shown as the hero banner below; strip it from the body
  // so it isn't rendered twice.
  const bodyHtml = image ? removeFirstImage(post.contentHtml) : post.contentHtml;

  return (
    <article className="mx-auto max-w-[680px] pt-4 sm:pt-8">
      <Link
        href={primary ? `/${primary.slug}` : "/"}
        className="font-label text-[11px] tracking-wide text-ink2 transition-colors hover:text-accent"
      >
        ← {primary ? primary.name : "Home"}
      </Link>

      <div
        className="reveal mb-5 mt-8 flex flex-wrap items-center gap-3.5"
        style={{ "--reveal-delay": "40ms" } as React.CSSProperties}
      >
        {post.categories.map(({ category }, i) => (
          <span key={category.slug} className="flex items-center gap-3.5">
            {i > 0 && (
              <span className="h-[3px] w-[3px] rounded-full bg-ink2" />
            )}
            <Link
              href={`/${category.slug}`}
              className="font-label text-[11px] uppercase tracking-wide text-accent"
            >
              {category.name}
            </Link>
          </span>
        ))}
        <span className="h-[3px] w-[3px] rounded-full bg-ink2" />
        <span className="font-label text-[11px] tracking-wide text-ink2">
          {date}
        </span>
        <span className="h-[3px] w-[3px] rounded-full bg-ink2" />
        <span className="font-label text-[11px] tracking-wide text-ink2">
          {readingMinutes(post.contentHtml)} min read
        </span>
      </div>

      <h1
        className="reveal m-0 mb-6 text-pretty font-serif text-[clamp(34px,5.4vw,52px)] font-normal leading-[1.06] tracking-tight text-ink"
        style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
      >
        {post.title}
      </h1>

      {post.excerpt && (
        <p
          className="reveal m-0 mb-11 text-pretty text-lg leading-relaxed text-ink2"
          style={{ "--reveal-delay": "150ms" } as React.CSSProperties}
        >
          {post.excerpt}
        </p>
      )}

      {image && (
        <div
          className="reveal relative mb-14 aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-bg2"
          style={{ "--reveal-delay": "200ms" } as React.CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {primary && (
        <div className="mt-14 border-t border-line pt-6">
          <Link
            href={`/${primary.slug}`}
            className="font-label text-[11px] tracking-wide text-ink2 transition-colors hover:text-accent"
          >
            ← More in {primary.name}
          </Link>
        </div>
      )}
    </article>
  );
}
