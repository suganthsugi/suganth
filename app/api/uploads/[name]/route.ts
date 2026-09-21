import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR, isSafeName, extToMime } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Serves a previously uploaded post image. Public — post images are public
 * content. Names are validated against a strict allowlist pattern to prevent
 * path traversal, and cached immutably since each name is unique per upload.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!isSafeName(name)) {
    return new Response("Bad request", { status: 400 });
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(path.join(UPLOADS_DIR, name));
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": extToMime(name),
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  // An optional `?filename=` lets the caller preserve the original download name
  // (files are stored under a uuid). Sanitized to avoid header injection; served
  // `inline` so PDFs still open in-tab but save with the friendly name.
  const requested = new URL(request.url).searchParams.get("filename");
  if (requested) {
    const clean = requested.replace(/[\r\n"\\/]/g, "").slice(0, 200);
    if (clean) {
      const ascii = clean.replace(/[^\x20-\x7E]/g, "_");
      headers["Content-Disposition"] =
        `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(clean)}`;
    }
  }

  return new Response(new Uint8Array(bytes), { headers });
}
