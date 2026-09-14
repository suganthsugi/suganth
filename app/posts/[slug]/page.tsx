import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readingMinutes } from "@/lib/content";

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
  const date = post.createdAt.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="text-sm text-muted transition-colors hover:text-accent"
      >
        ← Home
      </Link>

      <div className="mb-8 mt-6 border-b border-border pb-8">
        <div className="eyebrow mb-4 flex flex-wrap items-center gap-2">
          {post.categories.map(({ category }, i) => (
            <span key={category.slug} className="flex items-center gap-2">
              {i > 0 && <span className="text-accent">•</span>}
              <Link href={`/${category.slug}`} className="hover:text-fg">
                {category.name}
              </Link>
            </span>
          ))}
          <span className="text-accent">•</span>
          <span>{date}</span>
          <span className="text-accent">•</span>
          <span>{readingMinutes(post.contentHtml)} min read</span>
        </div>
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-fg-strong sm:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-5 text-lg leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}
      </div>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {primary && (
        <div className="mt-12 border-t border-border pt-6">
          <Link
            href={`/${primary.slug}`}
            className="text-sm text-muted transition-colors hover:text-accent"
          >
            ← More in {primary.name}
          </Link>
        </div>
      )}
    </article>
  );
}
