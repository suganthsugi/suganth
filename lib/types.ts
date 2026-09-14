/** Serializable shape passed from server pages to listing components. */
export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string | null;
  categories: { name: string; slug: string }[];
  createdAt: string;
};
