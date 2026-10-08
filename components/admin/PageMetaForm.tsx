"use client";

import { useActionState, useState, startTransition } from "react";
import type { PageMeta } from "@/lib/content-config";
import { savePageMeta } from "@/app/admin/(panel)/content/actions";
import ImageUpload from "@/components/admin/ImageUpload";
import SeoFields from "@/components/admin/SeoFields";

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

export default function PageMetaForm({ slug, path, defaultTitle, initial }: {
  slug: string; path: string; defaultTitle: string; initial: PageMeta;
}) {
  const [state, formAction, pending] = useActionState(savePageMeta.bind(null, slug), undefined);
  const e = state?.errors ?? {};
  const [title, setTitle] = useState(initial.title);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <Card title="Page header" hint="The big heading area at the top of the page.">
        <label className="block text-sm font-medium text-slate-700">
          Heading
          <input name="title" value={title} onChange={(ev) => setTitle(ev.target.value)} className={input} placeholder={defaultTitle} />
          {e.title && <span className="mt-1 block text-xs text-red-600">{e.title}</span>}
          <span className="mt-1 block text-xs font-normal text-slate-400">Leave empty to use "{defaultTitle}".</span>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Subheading
          <textarea name="subtitle" rows={2} defaultValue={initial.subtitle} className={input} />
          {e.subtitle && <span className="mt-1 block text-xs text-red-600">{e.subtitle}</span>}
        </label>
        <ImageUpload name="banner" typeName="bannerType" label="Banner (image or video)" folder="general" allowVideo
          defaultValue={initial.banner} defaultType={initial.bannerType === "VIDEO" ? "VIDEO" : "IMAGE"} serverError={e.banner} />
      </Card>

      <Card title="Search engine listing" hint="How this page appears on Google.">
        <SeoFields pageTitle={title || defaultTitle} slug={path.replace(/^\//, "")}
          defaults={{ metaTitle: initial.metaTitle, metaDescription: initial.metaDescription, metaKeywords: initial.metaKeywords }} />
        {(e.metaTitle || e.metaDescription || e.metaKeywords) && (
          <p className="text-xs text-red-600">{e.metaTitle || e.metaDescription || e.metaKeywords}</p>
        )}
      </Card>

      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 px-5 py-3 shadow-lg backdrop-blur">
        <div className="text-sm">
          {state?.ok && <span className="text-emerald-700">{state.message}</span>}
          {state && !state.ok && <span className="text-red-700">{state.message ?? "Please fix the highlighted fields."}</span>}
        </div>
        <button disabled={pending}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {pending ? "Saving…" : "Save page"}
        </button>
      </div>
    </form>
  );
}
