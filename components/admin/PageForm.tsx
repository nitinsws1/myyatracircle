"use client";

import Link from "next/link";
import { useActionState, useState, startTransition } from "react";
import { Lock } from "lucide-react";
import type { Page } from "@/app/generated/prisma/client";
import type { FormState } from "@/lib/form-state";
import { PAGE_SECTIONS, isSystemSlug } from "@/lib/cms-config";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SeoFields from "@/components/admin/SeoFields";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

export type SectionValues = Record<string, { title: string | null; content: string | null; imageUrl: string | null }>;

function Card({ title, hint, children }: { title?: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {(title || hint) && (
        <div>
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export default function PageForm({ action, initial, sections = {} }: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: Page;
  sections?: SectionValues;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const e = state?.errors ?? {};
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");

  const isSystem = initial ? isSystemSlug(initial.slug) : false;
  const sectionDefs = initial ? PAGE_SECTIONS[initial.slug] ?? [] : [];

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Page">
          <label className="block text-sm font-medium text-slate-700">
            Title *
            <input name="title" value={title} onChange={(ev) => setTitle(ev.target.value)} className={input} />
            {e.title && <span className="mt-1 block text-xs font-normal text-red-600">{e.title}</span>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            <span className="flex items-center gap-1.5">
              URL slug {isSystem && <Lock size={12} className="text-slate-400" />}
            </span>
            <input name="slug" value={slug} onChange={(ev) => setSlug(ev.target.value)} readOnly={isSystem}
              className={`${input} ${isSystem ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""}`} />
            {e.slug ? (
              <span className="mt-1 block text-xs font-normal text-red-600">{e.slug}</span>
            ) : (
              <span className="mt-1 block text-xs font-normal text-slate-400">
                {isSystem ? "This is a default page, so its URL can't be changed." : "Leave empty to create it from the title."}
              </span>
            )}
          </label>

          <div>
            <RichTextEditor name="content" label={sectionDefs.length ? "Introduction" : "Content"} defaultValue={initial?.content} />
            {e.content && <p className="mt-1 text-xs text-red-600">{e.content}</p>}
          </div>
        </Card>

        {sectionDefs.map((def) => (
          <Card key={def.key} title={def.label} hint={def.hint}>
            <label className="block text-sm font-medium text-slate-700">
              Heading
              <input name={`section_${def.key}_title`} defaultValue={sections[def.key]?.title ?? ""} className={input}
                placeholder={def.label} />
              {e[`section_${def.key}_title`] && (
                <span className="mt-1 block text-xs font-normal text-red-600">{e[`section_${def.key}_title`]}</span>
              )}
            </label>
            <RichTextEditor compact name={`section_${def.key}_content`} label="Text" defaultValue={sections[def.key]?.content} />
            <ImageUpload name={`section_${def.key}_image`} label="Image (optional)" folder="general"
              defaultValue={sections[def.key]?.imageUrl} serverError={e[`section_${def.key}_image`]} />
          </Card>
        ))}

        {sectionDefs.length > 0 && (
          <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
            "Why choose us" and "Our team" on the About page come from{" "}
            <Link href="/admin/team" className="text-teal-700 underline">Team & Why Us</Link>, so they are edited there.
          </p>
        )}

        <Card title="Search engine listing" hint="How this page appears on Google.">
          <SeoFields pageTitle={title} slug={slug}
            defaults={{ metaTitle: initial?.metaTitle, metaDescription: initial?.metaDescription, metaKeywords: initial?.metaKeywords }} />
        </Card>
      </div>

      <div className="h-fit space-y-6 lg:sticky lg:top-6">
        <Card>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isActive" defaultChecked={initial ? initial.isActive : true} className="h-4 w-4 accent-teal-700" />
            Active (visible on the website)
          </label>
          {isSystem && (
            <p className="text-xs text-slate-400">Default pages start as hidden. Switch this on after you add the content.</p>
          )}

          {state?.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}

          <div className="flex gap-3">
            <button disabled={pending}
              className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
              {pending ? "Saving…" : "Save page"}
            </button>
            <Link href="/admin/pages" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </Link>
          </div>
        </Card>
      </div>
    </form>
  );
}
