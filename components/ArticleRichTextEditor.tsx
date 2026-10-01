"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { markdownToEditorHtml, parseRichText, type ContentFormat } from "@/lib/article-content";

type Props = { value: string; format: string; onChange: (value: string, format: ContentFormat) => void; label: string };

export default function ArticleRichTextEditor({ value, format, onChange, label }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ link: false }), Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true })],
    content: format === "RICH_TEXT" ? parseRichText(value) as JSONContent || { type: "doc", content: [] } : markdownToEditorHtml(value),
    onUpdate: ({ editor: currentEditor }) => onChange(JSON.stringify(currentEditor.getJSON()), "RICH_TEXT"),
    editorProps: {
      attributes: {
        "aria-label": label,
        class: "min-h-[280px] px-3 py-3 outline-none",
      },
    },
  });

  function setLink() {
    const href = window.prompt("Link URL:");
    if (!href) return;
    editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  if (!editor) return <div className="min-h-[330px] border border-line bg-surface" aria-busy="true" />;

  const controls = [
    { label: "Bold", text: "B", active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", text: "I", active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Heading 2", text: "H2", active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", text: "H3", active: editor.isActive("heading", { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Bulleted list", text: "List", active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", text: "1. List", active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", text: "Quote", active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
  ];

  return <div className="rich-text-editor border border-line bg-surface">
    <div className="flex flex-wrap gap-1 border-b border-line p-2" role="toolbar" aria-label="Article formatting">
      {controls.map((control) => <button key={control.label} type="button" title={control.label} aria-label={control.label} aria-pressed={control.active} onClick={control.run} className={`min-h-9 min-w-9 border px-2 text-sm ${control.active ? "border-press bg-press/10 text-press" : "border-line hover:bg-ink/5"}`}>{control.text}</button>)}
      <button type="button" title="Insert link" aria-label="Insert link" onClick={setLink} className="min-h-9 border border-line px-2 text-sm hover:bg-ink/5">Link</button>
      {editor.isActive("link") && <button type="button" title="Remove link" aria-label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()} className="min-h-9 border border-line px-2 text-sm hover:bg-ink/5">Unlink</button>}
    </div>
    <EditorContent editor={editor} />
  </div>;
}