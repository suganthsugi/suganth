import Link from "next/link";
import type { PostListItem } from "@/lib/types";

/**
 * List (row) presentation. A small thumbnail appears on hover, sourced from the
 * post's rich-text content.
 */
export default function PostListRow({ post }: { post: PostListItem }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex items-center gap-4 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/50"
    >
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-fg/5">
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted transition-opacity group-hover:opacity-0">
          {post.image ? "preview" : "no image"}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="truncate text-sm text-muted">{post.excerpt}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-1.5">
          {post.categories.map((c) => (
            <span key={c.slug} className="text-xs text-muted">
              #{c.slug}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
