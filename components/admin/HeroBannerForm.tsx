"use client";

import Link from "next/link";
import { useActionState, useState, startTransition } from "react";
import { Film } from "lucide-react";
import type { HeroBanner } from "@/app/generated/prisma/client";
import type { FormState } from "@/lib/form-state";
import { youtubeId } from "@/lib/content-config";
import ImageUpload from "@/components/admin/ImageUpload";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Err({ text }: { text?: string }) {
  return text ? <span className="mt-1 block text-xs font-normal text-red-600">{text}</span> : null;
}

export default function HeroBannerForm({ action, initial }: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: HeroBanner;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const e = state?.errors ?? {};
  const [mode, setMode] = useState<"library" | "youtube">(initial?.mediaType === "youtube" ? "youtube" : "library");
  const [yt, setYt] = useState(initial?.mediaType === "youtube" ? initial.mediaUrl : "");
  const ytId = youtubeId(yt);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  const tab = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm ${active ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Banner media" hint=" Videos play muted and loop.">
          <input type="hidden" name="mode" value={mode} />
          

          {mode === "library" ? (
            <ImageUpload name="mediaUrl" typeName="mediaType" label="Hero media" folder="general" allowVideo
              defaultValue={initial?.mediaType === "youtube" ? "" : initial?.mediaUrl}
              defaultType={initial?.mediaType === "video" ? "VIDEO" : "IMAGE"} serverError={e.mediaUrl} />
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                YouTube link
                <input name="youtubeUrl" value={yt} onChange={(ev) => setYt(ev.target.value)} className={input}
                  placeholder="https://youtu.be/xxxxxxxxxxx" />
                <Err text={e.youtubeUrl} />
              </label>
              {ytId && (
                <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" className="mt-3 h-28 w-48 rounded-lg border border-slate-200 object-cover" />
              )}
              <p className="mt-2 text-xs text-slate-400">It plays muted and loops on the website. Uploaded videos give the best quality.</p>
            </div>
          )}
          <p className="text-xs text-slate-400">Use a wide picture (about 1920 × 1080) so it looks sharp on big screens.</p>
        </Card>

        <Card title="Text on the banner" hint="All optional. Leave everything empty for a banner with only the picture.">
          <label className="block text-sm font-medium text-slate-700">
            Heading
            <input name="heading" defaultValue={initial?.heading ?? ""} className={input} placeholder="Discover the real India" />
            <Err text={e.heading} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Sub-heading
            <textarea name="subHeading" rows={2} defaultValue={initial?.subHeading ?? ""} className={input} />
            <Err text={e.subHeading} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Button text
              <input name="ctaText" defaultValue={initial?.ctaText ?? ""} className={input} placeholder="Explore packages" />
              <Err text={e.ctaText} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Button link
              <input name="ctaUrl" defaultValue={initial?.ctaUrl ?? ""} className={input} placeholder="/packages" />
              <Err text={e.ctaUrl} />
            </label>
          </div>
        </Card>
      </div>

      <div className="h-fit space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" name="isActive" defaultChecked={initial ? initial.isActive : true} className="h-4 w-4 accent-teal-700" />
          Active (shown in the slider)
        </label>
        <p className="text-xs text-slate-400">Change the order with the arrows on the banners list.</p>

        {state?.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}

        <div className="flex gap-3">
          <button disabled={pending}
            className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {pending ? "Saving…" : "Save banner"}
          </button>
          <Link href="/admin/content/homepage?tab=hero" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
