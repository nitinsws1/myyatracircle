"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, startTransition } from "react";
import type { Blog } from "@/app/generated/prisma/client";
import type { FormState } from "@/lib/form-state";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

const pad = (n: number) => String(n).padStart(2, "0");
// Date -> "2026-10-05T14:30" in the BROWSER's local time (what the datetime-local box expects)
const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

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

export default function BlogForm({ action, categories, initial }: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  categories: { id: number; name: string }[];
  initial?: Blog;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const e = state?.errors ?? {};
  const dateRef = useRef<HTMLInputElement>(null);

  // Fill the date box after the page loads, so it shows the admin's own local time
  useEffect(() => {
    if (dateRef.current && initial?.publishedAt) {
      dateRef.current.value = toLocalInput(new Date(initial.publishedAt));
    }
  }, [initial]);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    fd.set("tzOffset", String(new Date().getTimezoneOffset())); // lets the server read the date correctly
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Blog post">
          <Field label="Title *" error={e.title}>
            <input name="title" defaultValue={initial?.title} className={input} />
          </Field>
          <Field label="Slug" error={e.slug} hint="Used in the URL. Leave empty to create it from the title.">
            <input name="slug" defaultValue={initial?.slug} className={input} />
          </Field>
          <Field label="Short description" hint="Shown on blog cards and as the intro in listings.">
            <textarea name="shortDescription" rows={2} defaultValue={initial?.shortDescription ?? ""} className={input} />
          </Field>
          <div>
            <RichTextEditor name="content" label="Content *" defaultValue={initial?.content} />
            {e.content && <p className="mt-1 text-xs text-red-600">{e.content}</p>}
          </div>
        </Card>

        <Card title="Featured image">
          <ImageUpload name="featuredImage" label="Image shown on the card and at the top of the post" folder="blogs"
            defaultValue={initial?.featuredImage} serverError={e.featuredImage} />
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
          <Field label="Publish date" error={e.publishedAt}
            hint="Leave empty to publish immediately. A future date schedules the post.">
            <input ref={dateRef} name="publishedAt" type="datetime-local" className={input} />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured} className="h-4 w-4 accent-teal-700" />
            Show on homepage (featured)
          </label>
        </Card>

        <Card title="Category">
          <Field label="Category" error={e.categoryId}>
            <select name="categoryId" defaultValue={initial?.categoryId ?? ""} className={input}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Link href="/admin/blogs/categories" className="text-xs text-teal-700 hover:underline">
            Manage categories
          </Link>
        </Card>

        {state?.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}

        <div className="flex gap-3">
          <button disabled={pending}
            className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {pending ? "Saving…" : "Save blog"}
          </button>
          <Link href="/admin/blogs" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
