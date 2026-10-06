"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Destination, DestinationMedia } from "@/app/generated/prisma/client";
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

export default function DestinationForm({
  action,
  initial,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: Destination & { gallery: DestinationMedia[] };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const e = state?.errors ?? {};

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      {/* Left: main content */}
      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
        <Field label="Name *" error={e.name}>
          <input name="name" defaultValue={initial?.name} className={input} />
        </Field>
        <Field label="Slug" error={e.slug} hint="Used in the URL. Leave empty to create it from the name.">
          <input name="slug" defaultValue={initial?.slug} className={input} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Region"><input name="region" defaultValue={initial?.region ?? ""} className={input} placeholder="North India" /></Field>
          <Field label="State"><input name="state" defaultValue={initial?.state ?? ""} className={input} placeholder="Rajasthan" /></Field>
        </div>
        <Field label="Short description" hint="Shown on cards (one or two lines).">
          <textarea name="shortDescription" rows={2} defaultValue={initial?.shortDescription ?? ""} className={input} />
        </Field>
        <RichTextEditor name="overview" label="Description" defaultValue={initial?.overview} />
        <div className="grid gap-5 sm:grid-cols-2">
          <ImageUpload name="bannerImage" typeName="bannerType" label="Banner (image or video)" folder="destinations"
            allowVideo defaultValue={initial?.bannerImage} defaultType={initial?.bannerType} serverError={e.bannerImage} />
          <ImageUpload name="thumbnailImage" label="Thumbnail image" folder="destinations"
            defaultValue={initial?.thumbnailImage} serverError={e.thumbnailImage} />
        </div>

        <MediaGalleryField name="gallery" label="Gallery (1 to 5 images / videos)" folder="destinations"
          initial={initial?.gallery.map((g) => ({ url: g.url, type: g.type }))} />
        {e.gallery && <p className="text-xs text-red-600">{e.gallery}</p>}

        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">SEO (meta tags)</summary>
          <div className="mt-4 space-y-4">
            <Field label="Meta title"><input name="metaTitle" defaultValue={initial?.metaTitle ?? ""} className={input} /></Field>
            <Field label="Meta description"><textarea name="metaDescription" rows={2} defaultValue={initial?.metaDescription ?? ""} className={input} /></Field>
            <Field label="Meta keywords"><input name="metaKeywords" defaultValue={initial?.metaKeywords ?? ""} className={input} /></Field>
          </div>
        </details>
      </div>

      {/* Right: publishing */}
      <div className="h-fit space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
        <Field label="Sort order" hint="Order in the destinations list.">
          <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} className={input} />
        </Field>

        {state?.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}

        <div className="flex gap-3 pt-2">
          <button disabled={pending}
            className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {pending ? "Saving…" : "Save"}
          </button>
          <Link href="/admin/destinations" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
