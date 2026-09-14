import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.categories.map(({ category }) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="rounded-full bg-fg/5 px-2.5 py-0.5 text-xs text-muted hover:text-fg"
            >
              {category.name}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <p className="mt-2 text-sm text-muted">
          {post.createdAt.toLocaleDateString()}
        </p>
      </div>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
