import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm from "../../PostForm";
import { updatePost } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { categories: true },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit post</h1>
      <div className="mt-6">
        <PostForm
          action={updatePost}
          categories={categories}
          submitLabel="Save changes"
          initial={{
            id: post.id,
            title: post.title,
            contentHtml: post.contentHtml,
            published: post.published,
            categoryIds: post.categories.map((c) => c.categoryId),
          }}
        />
      </div>
    </div>
  );
}
