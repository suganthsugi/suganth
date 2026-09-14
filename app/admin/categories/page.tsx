import { prisma } from "@/lib/prisma";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="mt-1 text-sm text-muted">
        Add or remove the categories posts can be filed under. Removing a
        category keeps its posts but unlinks them.
      </p>
      <div className="mt-6">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
