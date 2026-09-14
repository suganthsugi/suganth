import Link from "next/link";
import type { PostListItem } from "@/lib/types";

/**
 * Card presentation. The image is revealed on hover and comes from the post's
 * rich-text content (see `extractFirstImage`) — there is no cover-image field.
 */
export default function PostCard({ post }: { post: PostListItem }) {
  const date = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {post.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
              <span className="eyebrow">Preview</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="eyebrow opacity-60">No image</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {post.categories.slice(0, 2).map((c) => (
              <span
                key={c.slug}
                className="eyebrow rounded border border-border px-1.5 py-0.5 text-[0.6rem]"
              >
                {c.name}
              </span>
            ))}
          </div>
          <span className="text-xs text-muted">{date}</span>
        </div>
        <h3 className="font-serif text-xl leading-snug text-fg-strong transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
