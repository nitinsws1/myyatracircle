"use client";

import { useState } from "react";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

function Counter({ value, max }: { value: number; max: number }) {
  return <span className={`text-xs font-normal ${value > max ? "text-amber-600" : "text-slate-400"}`}>{value}/{max}</span>;
}

// Meta title / description / keywords with character counters and a preview of the Google result
export default function SeoFields({ pageTitle, slug, defaults }: {
  pageTitle: string;
  slug: string;
  defaults: { metaTitle?: string | null; metaDescription?: string | null; metaKeywords?: string | null };
}) {
  const [title, setTitle] = useState(defaults.metaTitle ?? "");
  const [desc, setDesc] = useState(defaults.metaDescription ?? "");

  const shownTitle = (title || pageTitle || "Page title").trim();
  const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Google preview</p>
        <p className="truncate text-xs text-slate-600">myyatracircle.com › {slug || "page-slug"}</p>
        <p className="mt-0.5 text-lg leading-snug text-blue-700">{clip(shownTitle, 60)}</p>
        <p className="mt-0.5 text-sm text-slate-600">
          {clip(desc.trim() || "No meta description yet. Google will pick text from the page instead.", 160)}
        </p>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        <span className="flex items-center justify-between">Meta title <Counter value={title.length} max={60} /></span>
        <input name="metaTitle" value={title} onChange={(e) => setTitle(e.target.value)} className={input}
          placeholder="Leave empty to use the page title" />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        <span className="flex items-center justify-between">Meta description <Counter value={desc.length} max={160} /></span>
        <textarea name="metaDescription" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className={input} />
        <span className="mt-1 block text-xs font-normal text-slate-400">About 150 to 160 characters works best.</span>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Meta keywords
        <input name="metaKeywords" defaultValue={defaults.metaKeywords ?? ""} className={input} />
        <span className="mt-1 block text-xs font-normal text-slate-400">Google ignores this, but it is kept as the proposal asks.</span>
      </label>
    </div>
  );
}
