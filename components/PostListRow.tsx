import Link from "next/link";
import type { PostListItem } from "@/lib/types";

/**
 * List (row) presentation matching the design: serif title + category tag on
 * the left, date on the right, hairline divider, subtle hover. A thumbnail from
 * the post content fades in on hover.
 */
export default function PostListRow({ post }: { post: PostListItem }) {
  const date = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex items-start justify-between gap-6 border-b border-border py-6 transition-colors last:border-b-0"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-serif text-xl text-fg-strong transition-colors group-hover:text-accent">
            {post.title}
          </h3>
          {post.categories[0] && (
            <span className="eyebrow rounded border border-border px-1.5 py-0.5 text-[0.6rem]">
              {post.categories[0].name}
            </span>
          )}
        </div>
        {post.excerpt && (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt=""
            className="hidden h-14 w-20 rounded-md object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block"
          />
        )}
        <span className="whitespace-nowrap pt-1 text-sm text-muted">{date}</span>
      </div>
    </Link>
  );
}
