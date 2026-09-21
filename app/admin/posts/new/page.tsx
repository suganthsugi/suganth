import { prisma } from "@/lib/prisma";
import PostForm from "../PostForm";
import { createPost } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">New post</h1>
      <div className="mt-6">
        <PostForm
          action={createPost}
          categories={categories}
          submitLabel="Create post"
          initial={{
            title: "",
            contentHtml: "",
            published: false,
            categoryIds: [],
            displayDate: new Date().toISOString().slice(0, 10),
          }}
        />
      </div>
    </div>
  );
}
