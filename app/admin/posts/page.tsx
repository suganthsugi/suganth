import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PostList from "./PostList";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { order: "asc" },
    include: { categories: { include: { category: true } } },
  });

  const items = posts.map((p) => ({
    id: p.id,
    title: p.title,
    published: p.published,
    categories: p.categories.map((pc) => pc.category.name),
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
        >
          New post
        </Link>
      </div>

      <PostList items={items} />
    </div>
  );
}
