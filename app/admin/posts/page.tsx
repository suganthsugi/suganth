import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { categories: { include: { category: true } } },
  });

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

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/posts/${p.id}/edit`}
                  className="truncate font-medium hover:text-accent"
                >
                  {p.title}
                </Link>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    p.published
                      ? "bg-green-500/15 text-green-600"
                      : "bg-fg/10 text-muted"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted">
                {p.categories.map((pc) => pc.category.name).join(", ") ||
                  "Uncategorized"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href={`/admin/posts/${p.id}/edit`}
                className="text-muted hover:text-fg"
              >
                Edit
              </Link>
              <form action={deletePost}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  className="text-muted hover:text-red-500"
                >
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted">
            No posts yet.{" "}
            <Link href="/admin/posts/new" className="text-accent">
              Create one
            </Link>
            .
          </li>
        )}
      </ul>
    </div>
  );
}
