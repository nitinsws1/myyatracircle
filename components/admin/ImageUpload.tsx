"use client";

import { useRef, useState } from "react";
import { FolderOpen, ImagePlus, Loader2, X } from "lucide-react";
import { KIND_RULES, type MediaKind } from "@/lib/media-config";
import { uploadAndRegister } from "@/lib/upload-client";
import MediaPicker from "@/components/admin/MediaPicker";

type Props = {
  name: string; // form field that carries the URL, e.g. "bannerImage"
  label: string;
  folder: string;
  defaultValue?: string | null;
  serverError?: string;
  allowVideo?: boolean; // true for hero/banner
  typeName?: string; // extra form field that says IMAGE or VIDEO, e.g. "bannerType"
  defaultType?: "IMAGE" | "VIDEO" | null;
};

export default function ImageUpload({
  name, label, folder, defaultValue, serverError, allowVideo = false, typeName, defaultType,
}: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [type, setType] = useState<"IMAGE" | "VIDEO">(defaultType ?? "IMAGE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const isVideo = file.type.startsWith("video/");
      if (isVideo && !allowVideo) throw new Error("Videos are not allowed here. Use a JPG, PNG or WebP image.");
      const up = await uploadAndRegister(file, folder, isVideo ? "VIDEO" : "IMAGE");
      setUrl(up.url);
      setType(up.kind === "VIDEO" ? "VIDEO" : "IMAGE");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const accept = [...KIND_RULES.IMAGE.mimes, ...(allowVideo ? KIND_RULES.VIDEO.mimes : [])].join(",");
  const pickerKinds: MediaKind[] = allowVideo ? ["IMAGE", "LOGO", "VIDEO"] : ["IMAGE", "LOGO"];
  const noun = allowVideo ? "image or video" : "image";

  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <input type="hidden" name={name} value={url} />
      {typeName && <input type="hidden" name={typeName} value={type} />}

      <div className="mt-1 flex items-center gap-4">
        {url ? (
          <div className="relative">
            {type === "VIDEO" ? (
              <video src={url} muted loop autoPlay playsInline className="h-24 w-36 rounded-lg border border-slate-200 object-cover" />
            ) : (
              <img src={url} alt="" className="h-24 w-36 rounded-lg border border-slate-200 object-cover" />
            )}
            <button type="button" onClick={() => { setUrl(""); setType("IMAGE"); }} title="Remove"
              className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-slate-500 shadow ring-1 ring-slate-200 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex h-24 w-36 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-300">
            <ImagePlus size={28} />
          </div>
        )}

        <div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {busy && <Loader2 size={14} className="animate-spin" />}
              {busy ? "Uploading…" : url ? `Replace ${noun}` : `Upload ${noun}`}
            </button>
            <button type="button" disabled={busy} onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <FolderOpen size={14} /> From library
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {allowVideo ? `${KIND_RULES.IMAGE.hint}; ${KIND_RULES.VIDEO.hint}` : KIND_RULES.IMAGE.hint}
          </p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept={accept} onChange={onFile} className="hidden" />
      {(error || serverError) && <p className="mt-1 text-xs text-red-600">{error || serverError}</p>}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} kinds={pickerKinds}
        onPick={(picked) => { setUrl(picked[0].url); setType(picked[0].kind === "VIDEO" ? "VIDEO" : "IMAGE"); setError(""); }} />
    </div>
  );
}
