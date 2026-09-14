import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [postCount, publishedCount, categoryCount] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.category.count(),
  ]);

  const cards = [
    {
      href: "/admin/posts",
      title: "Posts",
      desc: `${postCount} total · ${publishedCount} published`,
      cta: "Manage posts",
    },
    {
      href: "/admin/categories",
      title: "Categories",
      desc: `${categoryCount} categories`,
      cta: "Manage categories",
    },
    {
      href: "/admin/settings",
      title: "Site settings",
      desc: "Title, description, default view",
      cta: "Edit settings",
    },
    {
      href: "/admin/posts/new",
      title: "New post",
      desc: "Write with the rich-text editor",
      cta: "Create post",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50"
          >
            <h2 className="font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted">{c.desc}</p>
            <span className="mt-3 inline-block text-sm text-accent">
              {c.cta} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
