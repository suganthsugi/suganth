import path from "node:path";

/**
 * Filesystem storage for post images uploaded via the rich-text editor.
 *
 * Files are written to UPLOADS_DIR and served back through
 * `app/api/uploads/[name]/route.ts`. This is deliberately separate from the
 * avatar (which is a small downscaled data: URI on SiteConfig) — post images
 * may be large, so they are stored once on disk and referenced by URL instead
 * of inlined into the post HTML.
 *
 * In the production Docker image UPLOADS_DIR points at a mounted volume
 * (/app/uploads) so uploads survive container rebuilds; in dev it defaults to
 * `<cwd>/uploads` (gitignored).
 */
export const UPLOADS_DIR =
  process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");

/** 10 MB per image (kept in step with nginx `client_max_body_size`). */
export const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Accepted image types → stored extension. SVG is intentionally excluded: it
 * can carry scripts and would be served from our own origin, i.e. stored XSS.
 */
export const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

/** Stored file name: a uuid plus one of the allowed extensions. Anything else
 * (path separators, `..`, unknown extension) is rejected before touching disk. */
const SAFE_NAME = /^[A-Za-z0-9_-]+\.(png|jpg|webp|gif|avif)$/;

export function isSafeName(name: string): boolean {
  return SAFE_NAME.test(name);
}

export function extToMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}
