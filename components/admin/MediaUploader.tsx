"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DownloadCloud, Loader2, Upload } from "lucide-react";
import { KINDS, KIND_LABEL, KIND_RULES, type MediaKind } from "@/lib/media-config";
import { uploadAndRegister } from "@/lib/upload-client";
import { syncExistingMedia } from "@/app/admin/(panel)/media/actions";

// "Upload as: Image  [Upload]" like the library header
export default function MediaUploader() {
  const router = useRouter();
  const [kind, setKind] = useState<MediaKind>("IMAGE");
  const [pending, setPending] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setErrors([]);
    setPending(files.length);
    const errs: string[] = [];
    for (const f of files) {
      try {
        await uploadAndRegister(f, "library", kind);
      } catch (err) {
        errs.push(err instanceof Error ? err.message : `${f.name}: failed`);
      } finally {
        setPending((n) => n - 1);
      }
    }
    setErrors(errs);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value as MediaKind)} disabled={pending > 0}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-600">
          {KINDS.map((k) => <option key={k} value={k}>Upload as: {KIND_LABEL[k]}</option>)}
        </select>
        <button type="button" disabled={pending > 0} onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {pending > 0 ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {pending > 0 ? `Uploading ${pending}…` : "Upload"}
        </button>
        <input ref={fileRef} type="file" multiple accept={KIND_RULES[kind].mimes.join(",")} onChange={onFiles} className="hidden" />
      </div>
      <p className="text-xs text-slate-400">{KIND_RULES[kind].hint}</p>
      {errors.map((er) => <p key={er} className="text-xs text-red-600">{er}</p>)}
    </div>
  );
}

// One click: add images that were uploaded before the library existed
export function SyncButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  return (
    <div className="flex items-center gap-3">
      <button type="button" disabled={pending}
        onClick={() => start(async () => {
          const r = await syncExistingMedia();
          setMsg(r.added ? `Added ${r.added} file(s) to the library.` : "Nothing new to add. Everything is already in the library.");
          router.refresh();
        })}
        className="inline-flex items-center gap-2 text-sm text-teal-700 hover:underline disabled:opacity-60">
        {pending ? <Loader2 size={14} className="animate-spin" /> : <DownloadCloud size={14} />}
        Import files already used on the site
      </button>
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
    </div>
  );
}
