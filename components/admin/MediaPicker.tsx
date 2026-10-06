"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Play, Search, X } from "lucide-react";
import { KIND_PLURAL, type MediaKind } from "@/lib/media-config";

type Item = { id: number; url: string; name: string; kind: MediaKind; altText: string | null };

// "Choose from library" window. Uses the browser's built-in <dialog>, so Escape and focus handling just work.
export default function MediaPicker({ open, onClose, onPick, kinds, maxSelect = 1 }: {
  open: boolean;
  onClose: () => void;
  onPick: (items: { url: string; kind: MediaKind }[]) => void;
  kinds: MediaKind[];
  maxSelect?: number; // 1 = pick one image, more = pick several
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<MediaKind | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Item[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Item[]>([]);
  const kindsKey = kinds.join(",");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); setSelected([]); }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const params = new URLSearchParams({ q, kinds: (kind === "ALL" ? kinds : [kind]).join(","), page: String(page) });
      try {
        const res = await fetch(`/api/media?${params}`);
        const data = await res.json();
        if (cancelled) return;
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setHasMore(Boolean(data.hasMore));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, q ? 250 : 0); // small delay while typing
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, q, kind, page, kindsKey]);

  function toggle(it: Item) {
    setSelected((prev) => {
      if (maxSelect === 1) return [it];
      if (prev.some((p) => p.id === it.id)) return prev.filter((p) => p.id !== it.id);
      return prev.length >= maxSelect ? prev : [...prev, it];
    });
  }

  return (
    <dialog ref={ref} onClose={onClose}
      className="m-auto w-[min(56rem,95vw)] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/50">
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Choose from library</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, tag or alt text"
              className="w-64 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
          </div>
          {(["ALL", ...kinds] as const).map((k) => (
            <button type="button" key={k} onClick={() => { setKind(k); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-sm ${kind === k ? "bg-teal-700 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
              {k === "ALL" ? "All" : KIND_PLURAL[k]}
            </button>
          ))}
        </div>

        <div className="min-h-[18rem] flex-1 overflow-y-auto p-5">
          {items.length === 0 && !loading ? (
            <p className="py-16 text-center text-sm text-slate-400">
              Nothing found. Upload files in the{" "}
              <Link href="/admin/media" className="text-teal-700 underline">Media Library</Link> first.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((it) => {
                const on = selected.some((s) => s.id === it.id);
                return (
                  <li key={it.id}>
                    <button type="button" onClick={() => toggle(it)} title={it.name}
                      className={`relative block w-full overflow-hidden rounded-lg border-2 text-left ${on ? "border-teal-600" : "border-transparent hover:border-slate-300"}`}>
                      <div className="aspect-[4/3] bg-slate-100">
                        {it.kind === "VIDEO" ? (
                          <video src={it.url} muted preload="metadata" className="h-full w-full object-cover" />
                        ) : (
                          <img src={it.url} alt={it.altText ?? ""} className={`h-full w-full ${it.kind === "LOGO" ? "object-contain p-2" : "object-cover"}`} />
                        )}
                      </div>
                      {it.kind === "VIDEO" && (
                        <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                          <Play size={10} /> Video
                        </span>
                      )}
                      {on && (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-teal-600 p-1 text-white"><Check size={12} /></span>
                      )}
                      <p className="truncate px-2 py-1.5 text-xs text-slate-600">{it.name}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {loading && <p className="py-4 text-center text-sm text-slate-400">Loading…</p>}
          {hasMore && !loading && (
            <div className="pt-4 text-center">
              <button type="button" onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Load more</button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
          <span className="text-sm text-slate-500">
            {maxSelect > 1 ? `${selected.length} of ${maxSelect} selected` : selected.length ? "1 selected" : "Click an item to select it"}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="button" disabled={selected.length === 0}
              onClick={() => { onPick(selected.map((s) => ({ url: s.url, kind: s.kind }))); onClose(); }}
              className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50">
              Use selected
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
