"use client";

import { useActionState, useState, useTransition, startTransition } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { deleteMedia, updateMedia } from "@/app/admin/(panel)/media/actions";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

export default function MediaDetail({ id, url, name, altText, tags, usageCount }: {
  id: number; url: string; name: string; altText: string | null; tags: string[]; usageCount: number;
}) {
  const [state, formAction, saving] = useActionState(updateMedia.bind(null, id), undefined);
  const [copied, setCopied] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState("");

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function remove() {
    if (!confirm("Delete this file permanently? This also removes it from Cloudinary.")) return;
    setDeleteError("");
    startDelete(async () => {
      const r = await deleteMedia(id); // redirects on success, so we only get here on failure
      if (r && !r.ok) setDeleteError(r.message ?? "Could not delete");
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-500">File URL</p>
        <div className="mt-1 flex gap-2">
          <input readOnly value={url} onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600" />
          <button type="button" onClick={copy} title="Copy URL"
            className="rounded-lg border border-slate-300 px-3 text-slate-600 hover:bg-slate-50">
            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input name="name" defaultValue={name} className={input} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Alt text
          <input name="altText" defaultValue={altText ?? ""} className={input} placeholder="Describe the picture" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Tags
          <input name="tags" defaultValue={tags.join(", ")} className={input} placeholder="jaipur, palace, sunset" />
          <span className="mt-1 block text-xs font-normal text-slate-400">Separate with commas. Used for searching.</span>
        </label>

        {state?.message && (
          <p className={`rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{state.message}</p>
        )}
        <button disabled={saving}
          className="w-full rounded-lg bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {saving ? "Saving…" : "Save details"}
        </button>
      </form>

      <div className="border-t border-slate-100 pt-4">
        <button type="button" onClick={remove} disabled={deleting || usageCount > 0}
          title={usageCount > 0 ? "Remove it from where it is used first" : "Delete file"}
          className="inline-flex items-center gap-2 text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline">
          <Trash2 size={15} /> {deleting ? "Deleting…" : "Delete file"}
        </button>
        {usageCount > 0 && <p className="mt-1 text-xs text-slate-400">In use, so it can't be deleted yet.</p>}
        {deleteError && <p className="mt-1 text-xs text-red-600">{deleteError}</p>}
      </div>
    </div>
  );
}
