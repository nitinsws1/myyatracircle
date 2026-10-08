"use client";

import { useState } from "react";
import { X } from "lucide-react";

// Type a tag and press Enter (or comma). Existing tags are suggested, new ones are created on save.
export default function TagPicker({ name, options, initial, error }: {
  name: string; options: string[]; initial: string[]; error?: string;
}) {
  const [tags, setTags] = useState<string[]>(initial);
  const [text, setText] = useState("");
  const MAX = 10;

  function add(raw: string) {
    const t = raw.trim().replace(/\s+/g, " ");
    setText("");
    if (!t || t.length > 30 || tags.length >= MAX) return;
    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    const existing = options.find((o) => o.toLowerCase() === t.toLowerCase()); // keep the spelling already in use
    setTags((prev) => [...prev, existing ?? t]);
  }

  const suggestions = options.filter((o) => !tags.includes(o)).slice(0, 12);

  return (
    <div>
      <p className="text-sm font-medium text-slate-700">
        Tags <span className="font-normal text-slate-400">({tags.length}/{MAX})</span>
      </p>
      <input type="hidden" name={name} value={JSON.stringify(tags)} />

      <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-2 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-teal-50 py-1 pl-3 pr-1.5 text-sm text-teal-800">
            {t}
            <button type="button" title="Remove" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
              className="rounded-full p-0.5 hover:bg-teal-100"><X size={13} /></button>
          </span>
        ))}
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); }
            if (e.key === "Backspace" && !text && tags.length) setTags((prev) => prev.slice(0, -1));
          }}
          onBlur={() => text && add(text)}
          placeholder={tags.length ? "Add another…" : "Type a tag and press Enter"}
          className="min-w-[10rem] flex-1 bg-transparent px-1 py-1 text-sm text-slate-900 outline-none" />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400">Existing:</span>
          {suggestions.map((s) => (
            <button type="button" key={s} onClick={() => add(s)}
              className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50">+ {s}</button>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
