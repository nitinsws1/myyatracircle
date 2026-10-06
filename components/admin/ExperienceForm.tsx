"use client";

import Link from "next/link";
import { useActionState, startTransition } from "react";
import type {
  Experience, ExperienceMedia, ExperienceHighlight, ExperienceDestination,
} from "@/app/generated/prisma/client";
import type { FormState } from "@/lib/form-state";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaGalleryField from "@/components/admin/MediaGalleryField";
import StringListField from "@/components/admin/StringListField";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

type Initial = Experience & {
  gallery: ExperienceMedia[];
  highlights: ExperienceHighlight[];
  destinations: ExperienceDestination[];
};

function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
      {children}
    </section>
  );
}

export default function ExperienceForm({ action, cancelHref, destinations, initial }: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cancelHref: string;
  destinations: { id: number; name: string }[];
  initial?: Initial;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const e = state?.errors ?? {};
  const selected = new Set(initial?.destinations.map((d) => d.destinationId));

  // Submit manually so React does NOT clear the fields when the server returns an error
  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Basic details">
          <Field label="Experience name *" error={e.name}>
            <input name="name" defaultValue={initial?.name} className={input} placeholder="Desert Safari" />
          </Field>
          <Field label="Slug" error={e.slug} hint="Used in the URL. Leave empty to create it from the name.">
            <input name="slug" defaultValue={initial?.slug} className={input} />
          </Field>
          <Field label="Short description" hint="Shown on experience cards (one or two lines).">
            <textarea name="shortDescription" rows={2} defaultValue={initial?.shortDescription ?? ""} className={input} />
          </Field>
          <RichTextEditor name="overview" label="Description" defaultValue={initial?.overview} />
        </Card>

        <Card title="Media">
          <div className="grid gap-6 sm:grid-cols-2">
            <ImageUpload name="heroImage" typeName="heroType" label="Hero (image or video)" folder="experiences"
              allowVideo defaultValue={initial?.heroImage} defaultType={initial?.heroType} serverError={e.heroImage} />
            <ImageUpload name="thumbnailImage" label="Thumbnail (cards)" folder="experiences"
              defaultValue={initial?.thumbnailImage} serverError={e.thumbnailImage} />
          </div>
          <MediaGalleryField name="gallery" label="Gallery (1 to 5 images / videos)" folder="experiences"
            initial={initial?.gallery.map((g) => ({ url: g.url, type: g.type }))} />
          {e.gallery && <p className="text-xs text-red-600">{e.gallery}</p>}
        </Card>

        <Card title="Highlights">
          <StringListField name="highlights" label="Experience highlights" placeholder="e.g. Sunset camel ride"
            hint="Press Enter to add the next one." initial={initial?.highlights.map((h) => h.text)} />
        </Card>

        <details className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-slate-900">SEO (meta tags)</summary>
          <div className="mt-4 space-y-4">
            <Field label="Meta title"><input name="metaTitle" defaultValue={initial?.metaTitle ?? ""} className={input} /></Field>
            <Field label="Meta description"><textarea name="metaDescription" rows={2} defaultValue={initial?.metaDescription ?? ""} className={input} /></Field>
            <Field label="Meta keywords"><input name="metaKeywords" defaultValue={initial?.metaKeywords ?? ""} className={input} /></Field>
          </div>
        </details>
      </div>

      <div className="h-fit space-y-6 lg:sticky lg:top-6">
        <Card>
          <Field label="Status">
            <select name="status" defaultValue={initial?.status ?? "DRAFT"} className={input}>
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured} className="h-4 w-4 accent-teal-700" />
            Show on homepage (featured)
          </label>
          <Field label="Featured order" hint="Lower number shows first.">
            <input name="featuredOrder" type="number" defaultValue={initial?.featuredOrder ?? ""} className={input} />
          </Field>
          <Field label="Sort order" hint="Order in the experiences list.">
            <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} className={input} />
          </Field>
        </Card>

        <Card title="Related destinations">
          {destinations.length === 0 ? (
            <p className="text-sm text-slate-400">Add destinations first, then link them here.</p>
          ) : (
            <ul className="max-h-56 space-y-2 overflow-y-auto">
              {destinations.map((d) => (
                <li key={d.id}>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="destinationIds" value={d.id}
                      defaultChecked={selected.has(d.id)} className="h-4 w-4 accent-teal-700" />
                    {d.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-slate-400">Shown as &quot;Related Destinations&quot; on the experience page.</p>
        </Card>

        {state?.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}

        <div className="flex gap-3">
          <button disabled={pending}
            className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {pending ? "Saving…" : "Save experience"}
          </button>
          <Link href={cancelHref} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
