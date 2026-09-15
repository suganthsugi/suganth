"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";

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
        // --- Image upload/paste without a storage backend ---
        // There is no file server, so every image is inlined into the post
        // HTML as a base64 data URI (the same approach the avatar uploader
        // uses). This turns on the dialog's "Upload" tab, drag-and-drop, and
        // clipboard paste; large images make the stored HTML bigger, so prefer
        // reasonably sized images.
        paste_data_images: true,
        automatic_uploads: true,
        image_uploadtab: true,
        images_upload_handler: (blobInfo) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Could not read image"));
            reader.readAsDataURL(blobInfo.blob());
          }),
        // "Browse" button next to the Source URL field: pick a local image and
        // inline it as a data URI.
        file_picker_types: "image",
        file_picker_callback: (cb, _value, meta) => {
          if (meta.filetype !== "image") return;
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () =>
              cb(reader.result as string, { title: file.name });
            reader.readAsDataURL(file);
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
