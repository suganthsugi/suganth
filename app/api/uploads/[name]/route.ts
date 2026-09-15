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
  _request: Request,
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

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": extToMime(name),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
