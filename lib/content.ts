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
