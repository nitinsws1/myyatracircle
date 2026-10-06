"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3, List, ListOrdered,
  Quote, Link as LinkIcon, Undo2, Redo2, RemoveFormatting,
} from "lucide-react";

function Btn({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button type="button" title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-md p-1.5 transition ${active ? "bg-teal-100 text-teal-800" : "text-slate-600 hover:bg-slate-100"}`}>
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt("Link URL (leave empty to remove the link)", previous ?? "https://");
    if (input === null) return;
    const url = input.trim();
    if (url === "" || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^(https?:\/\/|mailto:|tel:)/i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const sep = <span className="mx-1 h-5 w-px bg-slate-200" />;
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Btn>
      <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={16} /></Btn>
      <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></Btn>
      {sep}
      <Btn title="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Btn>
      <Btn title="Sub-heading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></Btn>
      {sep}
      <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></Btn>
      <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
      <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Btn>
      <Btn title="Link" active={editor.isActive("link")} onClick={setLink}><LinkIcon size={16} /></Btn>
      {sep}
      <Btn title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting size={16} /></Btn>
      <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></Btn>
      <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></Btn>
    </div>
  );
}

// Two ways to use it:
//  1) normal form field:      <RichTextEditor name="overview" ... />   (renders a hidden input)
//  2) inside a repeater list: <RichTextEditor onChange={...} ... />    (no name, parent keeps the value)
export default function RichTextEditor({ name, label, defaultValue, hint, onChange, compact }: {
  name?: string; label?: string; defaultValue?: string | null; hint?: string;
  onChange?: (html: string) => void; compact?: boolean;
}) {
  const [html, setHtml] = useState(defaultValue ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false },
      }),
    ],
    content: defaultValue ?? "",
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: `rich-content ${compact ? "min-h-[130px]" : "min-h-[220px]"} max-h-[520px] overflow-y-auto px-4 py-3 text-sm text-slate-900 outline-none`,
      },
    },
    onUpdate: ({ editor }) => {
      const value = editor.getHTML();
      setHtml(value);
      onChange?.(value);
    },
  });

  return (
    <div>
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
      {name && <input type="hidden" name={name} value={html} />}
      <div className="mt-1 overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100">
        {editor ? <Toolbar editor={editor} /> : <div className="h-10 border-b border-slate-200 bg-slate-50" />}
        <EditorContent editor={editor} />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
