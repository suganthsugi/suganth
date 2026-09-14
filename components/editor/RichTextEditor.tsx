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
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-lg border border-border bg-surface text-sm text-muted">
        Loading editor…
      </div>
    );
  }

  return (
    <Editor
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
          "body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;line-height:1.7;padding:8px 12px} img{max-width:100%;height:auto;border-radius:12px} pre{background:#1113;padding:12px;border-radius:8px;overflow:auto}",
        image_caption: true,
        image_title: true,
        // Allow pasting/inserting images as data URIs (no upload backend needed).
        paste_data_images: true,
        skin: "oxide",
        content_css: "default",
      }}
    />
  );
}
