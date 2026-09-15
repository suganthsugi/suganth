import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { UPLOADS_DIR, MAX_BYTES, MIME_TO_EXT } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Accepts an image file (multipart form field `file`) from the rich-text
 * editor, stores it under UPLOADS_DIR, and returns `{ location }` — the URL the
 * editor inserts as the image `src`. Admin-only: `/api/*` is not covered by the
 * edge middleware, so the session is checked here.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return Response.json(
      { error: "Unsupported image type. Use PNG, JPEG, WebP, GIF or AVIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "Image is too large (max 10 MB)." },
      { status: 413 },
    );
  }

  const name = `${randomUUID()}.${ext}`;
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOADS_DIR, name), bytes);
  } catch {
    return Response.json({ error: "Could not save image." }, { status: 500 });
  }

  return Response.json({ location: `/api/uploads/${name}` });
}
