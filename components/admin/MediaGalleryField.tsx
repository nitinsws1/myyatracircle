"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FolderOpen, ImagePlus, Loader2, Play, X } from "lucide-react";
import { KIND_RULES, kindFromFile } from "@/lib/media-config";
import { uploadAndRegister } from "@/lib/upload-client";
import MediaPicker from "@/components/admin/MediaPicker";

export type MediaItem = { url: string; type: "IMAGE" | "VIDEO" };

export default function MediaGalleryField({ name, label, folder, initial = [], max = 5 }: {
  name: string; label: string; folder: string; initial?: MediaItem[]; max?: number;
}) {
  const [items, setItems] = useState<MediaItem[]>(initial);
  const [pending, setPending] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const room = max - items.length;

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    let files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const errs: string[] = [];
    if (files.length > room) {
      errs.push(`Only ${max} items allowed. ${files.length - room} file(s) were skipped.`);
      files = files.slice(0, room);
    }
    setErrors([]);
    setPending(files.length);
    for (const f of files) {
      try {
        const kind = kindFromFile(f);
        if (kind !== "IMAGE" && kind !== "VIDEO") throw new Error(`${f.name}: use JPG, PNG, WebP, MP4 or WebM`);
        const up = await uploadAndRegister(f, folder, kind);
        setItems((prev) => [...prev, { url: up.url, type: up.kind === "VIDEO" ? "VIDEO" : "IMAGE" }]);
      } catch (err) {
        errs.push(err instanceof Error ? err.message : `${f.name}: failed`);
      } finally {
        setPending((n) => n - 1);
      }
    }
    setErrors(errs);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addFromLibrary(picked: { url: string; kind: string }[]) {
    setItems((prev) => {
      const have = new Set(prev.map((p) => p.url));
      const fresh = picked.filter((p) => !have.has(p.url)).map((p) => ({ url: p.url, type: (p.kind === "VIDEO" ? "VIDEO" : "IMAGE") as "IMAGE" | "VIDEO" }));
      return [...prev, ...fresh].slice(0, max);
    });
  }

  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const remove = (i: number) => setItems((prev) => prev.filter((_, k) => k !== i));

  const full = room <= 0;
  const btn = "inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">{label} <span className="font-normal text-slate-400">({items.length}/{max})</span></p>
        <div className="flex gap-2">
          <button type="button" disabled={pending > 0 || full} onClick={() => fileRef.current?.click()} className={btn}>
            {pending > 0 ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            {pending > 0 ? `Uploading ${pending}…` : full ? `Maximum ${max} reached` : "Upload"}
          </button>
          <button type="button" disabled={pending > 0 || full} onClick={() => setPickerOpen(true)} className={btn}>
            <FolderOpen size={14} /> From library
          </button>
        </div>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <input ref={fileRef} type="file" multiple accept={[...KIND_RULES.IMAGE.mimes, ...KIND_RULES.VIDEO.mimes].join(",")} onChange={onFiles} className="hidden" />

      {items.length === 0 ? (
        <div className="mt-2 flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-400">
          No gallery items yet. Add 1 to {max} items. {KIND_RULES.IMAGE.hint}; {KIND_RULES.VIDEO.hint}.
        </div>
      ) : (
        <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((m, i) => (
            <li key={m.url + i} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {m.type === "VIDEO" ? (
                <div className="relative">
                  <video src={m.url} muted preload="metadata" className="h-24 w-full object-cover" />
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    <Play size={10} /> Video
                  </span>
                </div>
              ) : (
                <img src={m.url} alt="" className="h-24 w-full object-cover" />
              )}
              <div className="flex items-center justify-between bg-white px-1 py-1">
                <div className="flex">
                  <button type="button" title="Move left" disabled={i === 0} onClick={() => move(i, -1)}
                    className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowLeft size={14} /></button>
                  <button type="button" title="Move right" disabled={i === items.length - 1} onClick={() => move(i, 1)}
                    className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowRight size={14} /></button>
                </div>
                <button type="button" title="Remove" onClick={() => remove(i)}
                  className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"><X size={14} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pending > 0 && <p className="mt-2 text-xs text-amber-600">Wait for uploads to finish before clicking Save.</p>}
      {errors.map((er) => <p key={er} className="mt-1 text-xs text-red-600">{er}</p>)}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} kinds={["IMAGE", "VIDEO"]}
        maxSelect={Math.max(1, room)} onPick={addFromLibrary} />
    </div>
  );
}
