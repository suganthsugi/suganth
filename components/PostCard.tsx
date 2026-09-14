import Link from "next/link";
import type { PostListItem } from "@/lib/types";

/**
 * Card presentation. The image is revealed on hover and comes from the post's
 * rich-text content (see `extractFirstImage`) — there is no cover-image field.
 */
export default function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] bg-fg/5">
        {post.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-0 scale-105 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100"
            />
            <div className="absolute inset-0 flex items-center justify-center text-muted transition-opacity duration-300 group-hover:opacity-0">
              <span className="text-sm">Hover to preview</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            <span className="text-sm">No preview image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {post.categories.map((c) => (
            <span
              key={c.slug}
              className="rounded-full bg-fg/5 px-2 py-0.5 text-xs text-muted"
            >
              {c.name}
            </span>
          ))}
        </div>
        <h3 className="font-semibold leading-snug group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1 text-sm text-muted line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
