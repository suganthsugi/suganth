/** Convert an arbitrary string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Ensure a slug is unique against an async existence check, appending -2, -3…
 * `exists(slug)` should resolve true when the slug is already taken.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "item";
  let candidate = root;
  let n = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}
