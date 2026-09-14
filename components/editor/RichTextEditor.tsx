"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useCallback } from "react";

/**
 * Rich-text editor. Emits HTML via onChange. Images added here are what the
 * public listing pulls its hover preview from — there is no cover field.
 */
export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false, // required with Next.js SSR
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose min-h-[320px] px-4 py-3 focus:outline-none",
        "data-placeholder": "Write your post…",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const addImage = useCallback(() => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-1 border-b border-border p-2">
      <Btn on={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </Btn>
      <Btn on={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </Btn>
      <Btn on={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Btn>
      <Btn on={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Btn>
      <Btn on={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </Btn>
      <Btn on={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </Btn>
      <Btn on={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        Quote
      </Btn>
      <Btn on={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        Code
      </Btn>
      <Btn on={editor.isActive("link")} onClick={setLink}>
        Link
      </Btn>
      <Btn on={false} onClick={addImage}>
        Image
      </Btn>
    </div>
  );
}

function Btn({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-sm transition-colors ${
        on ? "bg-accent text-accent-fg" : "text-fg hover:bg-fg/5"
      }`}
    >
      {children}
    </button>
  );
}
