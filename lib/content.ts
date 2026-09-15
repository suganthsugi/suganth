/**
 * Helpers for deriving presentation data from a post's rich-text HTML.
 * Per the design, there is no separate cover-image field: the listing hover
 * image is the first <img> found in the content.
 */

/** Return the src of the first <img> in the HTML, or null if none. */
export function extractFirstImage(html: string | null | undefined): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/**
 * Remove the first <img> from the HTML (plus its wrapping <p>/<figure> if that
 * leaves the wrapper empty). The post page shows the first image as a hero
 * banner derived via `extractFirstImage`, so it must not also appear inline in
 * the rendered body. No-op when there's no image.
 */
export function removeFirstImage(html: string | null | undefined): string {
  if (!html) return "";
  let removed = false;
  let out = html.replace(/<img[^>]*>/i, () => {
    removed = true;
    return "";
  });
  if (!removed) return html;
  // Drop a now-empty wrapper left behind by the image (first occurrence only).
  out = out.replace(/<p>\s*<\/p>/i, "");
  out = out.replace(/<figure[^>]*>\s*<\/figure>/i, "");
  return out;
}

/** Strip HTML tags to plain text (server-safe, no DOM). */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build a short excerpt from HTML content. */
export function makeExcerpt(html: string | null | undefined, max = 160): string {
  const text = stripHtml(html);
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

/** Estimated reading time in minutes (min 1) from HTML content. */
export function readingMinutes(html: string | null | undefined): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Split `text` around the first occurrence of `highlight` (case-insensitive),
 * for rendering the hero headline with one accent-highlighted phrase. Returns
 * null when there's nothing to highlight or the phrase isn't found, so the
 * caller can fall back to rendering `text` plain.
 */
export function splitHighlight(
  text: string,
  highlight: string | null | undefined,
): { before: string; match: string; after: string } | null {
  const needle = highlight?.trim();
  if (!needle) return null;
  const i = text.toLowerCase().indexOf(needle.toLowerCase());
  if (i === -1) return null;
  return {
    before: text.slice(0, i),
    match: text.slice(i, i + needle.length),
    after: text.slice(i + needle.length),
  };
}
