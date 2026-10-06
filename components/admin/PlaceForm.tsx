"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Place, PlaceMedia } from "@/app/generated/prisma/client";
import type { FormState } from "@/lib/form-state";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaGalleryField from "@/components/admin/MediaGalleryField";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

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

export default function PlaceForm({ action, cancelHref, initial }: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cancelHref: string;
  initial?: Place & { gallery: PlaceMedia[] };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const e = state?.errors ?? {};

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Field label="Name *" error={e.name}>
            <input name="name" defaultValue={initial?.name} className={input} placeholder="Amber Fort" />
          </Field>
          <Field label="Slug" error={e.slug} hint="Must be unique across all places. Leave empty to create it from the name.">
            <input name="slug" defaultValue={initial?.slug} className={input} />
          </Field>
          <RichTextEditor name="about" label="Description" defaultValue={initial?.about} />

          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">SEO (meta tags)</summary>
            <div className="mt-4 space-y-4">
              <Field label="Meta title"><input name="metaTitle" defaultValue={initial?.metaTitle ?? ""} className={input} /></Field>
              <Field label="Meta description"><textarea name="metaDescription" rows={2} defaultValue={initial?.metaDescription ?? ""} className={input} /></Field>
            </div>
          </details>
        </div>

        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            <ImageUpload name="heroImage" typeName="heroType" label="Hero (image or video)" folder="places"
              allowVideo defaultValue={initial?.heroImage} defaultType={initial?.heroType} serverError={e.heroImage} />
            <ImageUpload name="thumbnailImage" label="Thumbnail (cards)" folder="places"
              defaultValue={initial?.thumbnailImage} serverError={e.thumbnailImage} />
          </div>
          <MediaGalleryField name="gallery" label="Gallery (1 to 5 images / videos)" folder="places" max={5}
            initial={initial?.gallery.map((g) => ({ url: g.url, type: g.type }))} />
          {e.gallery && <p className="text-xs text-red-600">{e.gallery}</p>}
        </div>
      </div>

      <div className="h-fit space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Field label="Status">
          <select name="status" defaultValue={initial?.status ?? "DRAFT"} className={input}>
            <option value="DRAFT">Draft (hidden)</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </Field>
        <Field label="Sort order" hint="Lower number shows first.">
          <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} className={input} />
        </Field>

        {state?.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}

        <div className="flex gap-3 pt-2">
          <button disabled={pending}
            className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {pending ? "Saving…" : "Save"}
          </button>
          <Link href={cancelHref} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
