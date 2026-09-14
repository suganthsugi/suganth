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
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-bg2/40 transition-colors hover:border-accent/50 hover:shadow-[0_0_30px_-12px_rgb(var(--glow)_/_var(--glow-a))]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg2">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(220px circle at 50% 120%, rgb(var(--ambient) / var(--ambient-a)), transparent 72%)",
          }}
        />
        {post.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
              <span className="eyebrow relative text-ink2">Preview</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="eyebrow relative text-ink2 opacity-60">No image</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {post.categories.slice(0, 2).map((c) => (
              <span
                key={c.slug}
                className="eyebrow rounded-full border border-line px-2 py-0.5 text-[10px] text-ink2"
              >
                {c.name}
              </span>
            ))}
          </div>
          <span className="font-label text-[11px] text-ink2">{date}</span>
        </div>
        <h3 className="font-serif text-xl leading-snug text-ink transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink2">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
