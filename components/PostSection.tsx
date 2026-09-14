import type { PostListItem } from "@/lib/types";
import PostHoverList from "./PostHoverList";

/**
 * Renders a set of posts in whichever style the category is configured for
 * (`Category.listStyle`, set in admin): "card" rows (title, tag, description,
 * date, hover glow) or "list" rows (title + date only). There is no
 * visitor-facing toggle; the site owner decides.
 */
export default function PostSection({
  posts,
  listStyle,
}: {
  posts: PostListItem[];
  listStyle: "card" | "list";
}) {
  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line p-10 text-center text-ink2">
        Nothing here yet.
      </p>
    );
  }

  return <PostHoverList posts={posts} style={listStyle} />;
}
