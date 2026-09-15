"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";

/** Upload one image to /api/uploads and resolve the stored URL. Rejects with a
 * message TinyMCE surfaces to the user (and `remove` drops the failed image). */
async function uploadImage(blob: Blob, filename: string): Promise<string> {
  const body = new FormData();
  body.append("file", blob, filename);
  let res: Response;
  try {
    res = await fetch("/api/uploads", { method: "POST", body });
  } catch {
    return Promise.reject({ message: "Network error during upload.", remove: true });
  }
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    return Promise.reject({
      message: detail?.error ?? `Upload failed (${res.status}).`,
      remove: true,
    });
  }
  const json = await res.json();
  return json.location as string;
}

/**
 * Self-hosted TinyMCE rich-text editor (loaded from /public/tinymce — no API
 * key, no external CDN). Emits HTML via onChange. Images inserted here are what
 * the public listing pulls its hover preview from — there is no cover field.
 */
export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  // Render client-only: the TinyMCE wrapper assigns a random textarea id, which
  // otherwise causes a server/client hydration mismatch.
  const [mounted, setMounted] = useState(false);
  // Follow the site's color scheme (driven by prefers-color-scheme).
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    // Effective theme: explicit [data-theme] override wins over the system pref.
    const resolve = () => {
      const explicit = document.documentElement.dataset.theme;
      if (explicit === "dark") return true;
      if (explicit === "light") return false;
      return mq.matches;
    };
    setDark(resolve());
    const update = () => setDark(resolve());
    mq.addEventListener("change", update);
    window.addEventListener("themechange", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("themechange", update);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-lg border border-border bg-surface text-sm text-muted">
        Loading editor…
      </div>
    );
  }

  return (
    <Editor
      // Re-mount when the theme flips so the new skin/content CSS applies.
      key={dark ? "dark" : "light"}
      // Load TinyMCE locally instead of Tiny Cloud.
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      onInit={(_evt, editor) => {
        editorRef.current = editor;
      }}
      initialValue={value}
      onEditorChange={(html) => onChange(html)}
      init={{
        height: 480,
        menubar: "edit view insert format table",
        promotion: false,
        branding: false,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "wordcount",
          "codesample",
          "emoticons",
        ],
        toolbar:
          "undo redo | blocks | bold italic underline strikethrough | " +
          "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image media table codesample | " +
          "blockquote emoticons charmap | removeformat code fullscreen preview",
        // The editor renders inside an iframe; style its content to roughly
        // match the site's reading typography.
        content_style:
          "body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;line-height:1.7;padding:8px 12px} img{max-width:100%;height:auto;border-radius:12px} pre{background:#8881;padding:12px;border-radius:8px;overflow:auto}",
        image_caption: true,
        image_title: true,
        // --- Image upload/paste (stored server-side, referenced by URL) ---
        // Uploaded, dropped and pasted images POST to /api/uploads, which
        // stores the file and returns its URL; the editor inserts that URL as
        // the image src rather than inlining a large base64 data URI. This
        // enables the dialog's "Upload" tab, drag-and-drop, clipboard paste,
        // and the Source-field browse button. `paste_data_images` stays off so
        // pastes go through automatic_uploads → the handler → the server.
        paste_data_images: false,
        automatic_uploads: true,
        image_uploadtab: true,
        images_upload_handler: (blobInfo) =>
          uploadImage(blobInfo.blob(), blobInfo.filename()),
        file_picker_types: "image",
        file_picker_callback: (cb, _value, meta) => {
          if (meta.filetype !== "image") return;
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            uploadImage(file, file.name).then(
              (location) => cb(location, { title: file.name }),
              (err) => window.alert(err?.message ?? "Upload failed"),
            );
          };
          input.click();
        },
        // Theme-aware skin + content CSS.
        skin: dark ? "oxide-dark" : "oxide",
        content_css: dark ? "dark" : "default",
      }}
    />
  );
}
