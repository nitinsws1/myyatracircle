"use client";

import Link from "next/link";
import { useActionState, useState, startTransition } from "react";
import {
  Lock,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Users,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { Page } from "@/app/generated/prisma/client";
import type { FormState } from "@/lib/form-state";
import { isSystemSlug } from "@/lib/cms-config";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SeoFields from "@/components/admin/SeoFields";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

export type SectionItem = {
  clientKey: string;
  id?: number;
  sectionKey: string;
  title: string;
  content: string;
  imageUrl: string;
  sortOrder: number;
};

export type RawSectionInput = {
  id?: number;
  sectionKey: string;
  title?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
};

function Card({
  title,
  hint,
  children,
  action,
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {(title || hint || action) && (
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

const ABOUT_PRESETS = [
  { key: "brandStory", title: "Brand Story", hint: "How the company started and what it stands for." },
  { key: "vision", title: "Vision", hint: "Where the company aims to go in the future." },
  { key: "mission", title: "Mission", hint: "What the company delivers each day." },
  { key: "expertise", title: "Travel Expertise", hint: "Destinations covered, years of experience, partnerships." },
];

export default function PageForm({
  action,
  initial,
  sections: initialSections = [],
  teamCount = 0,
  whyUsCount = 0,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: Page;
  sections?: RawSectionInput[];
  teamCount?: number;
  whyUsCount?: number;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const e = state?.errors ?? {};
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");

  const isSystem = initial ? isSystemSlug(initial.slug) : false;
  const isAboutPage = initial ? initial.slug === "about-us" : slug === "about-us";

  // Build section items with stable unique clientKeys for reordering
  const [sections, setSections] = useState<SectionItem[]>(() => {
    if (initialSections.length > 0) {
      return initialSections.map((s, idx) => ({
        clientKey: `init-${s.id ?? idx}-${Math.random().toString(36).slice(2, 7)}`,
        id: s.id,
        sectionKey: s.sectionKey || `section-${idx + 1}`,
        title: s.title ?? "",
        content: s.content ?? "",
        imageUrl: s.imageUrl ?? "",
        sortOrder: s.sortOrder ?? idx,
      }));
    }
    // Default presets for a brand new About Us page if empty
    if (isAboutPage) {
      return ABOUT_PRESETS.map((p, idx) => ({
        clientKey: `preset-${p.key}-${Math.random().toString(36).slice(2, 7)}`,
        sectionKey: p.key,
        title: p.title,
        content: "",
        imageUrl: "",
        sortOrder: idx,
      }));
    }
    return [];
  });

  function addSection(preset?: { key: string; title: string }) {
    const nextOrder = sections.length;
    const newKey = preset ? preset.key : `section-${nextOrder + 1}`;
    setSections((prev) => [
      ...prev,
      {
        clientKey: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sectionKey: newKey,
        title: preset ? preset.title : `New Section ${nextOrder + 1}`,
        content: "",
        imageUrl: "",
        sortOrder: nextOrder,
      },
    ]);
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy.map((item, idx) => ({ ...item, sortOrder: idx }));
    });
  }

  function updateSection(index: number, updates: Partial<SectionItem>) {
    setSections((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  }

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    // Explicitly package the current sections array into sectionsData
    fd.set("sectionsData", JSON.stringify(sections.map((s, idx) => ({ ...s, sortOrder: idx }))));
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Main Page Header & Content */}
        <Card title="Page Details">
          <label className="block text-sm font-medium text-slate-700">
            Title *
            <input
              name="title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              className={input}
              placeholder="e.g. About Us"
            />
            {e.title && <span className="mt-1 block text-xs font-normal text-red-600">{e.title}</span>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            <span className="flex items-center gap-1.5">
              URL slug {isSystem && <Lock size={12} className="text-slate-400" />}
            </span>
            <input
              name="slug"
              value={slug}
              onChange={(ev) => setSlug(ev.target.value)}
              readOnly={isSystem}
              className={`${input} ${isSystem ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""}`}
            />
            {e.slug ? (
              <span className="mt-1 block text-xs font-normal text-red-600">{e.slug}</span>
            ) : (
              <span className="mt-1 block text-xs font-normal text-slate-400">
                {isSystem
                  ? "This is a default system page; its URL cannot be changed."
                  : "Leave empty to automatically generate from the title."}
              </span>
            )}
          </label>

          <div>
            <RichTextEditor
              name="content"
              label={sections.length > 0 ? "Introduction (Optional)" : "Page Content"}
              defaultValue={initial?.content}
              hint="Main body content or introduction for this page."
            />
            {e.content && <p className="mt-1 text-xs text-red-600">{e.content}</p>}
          </div>
        </Card>

        {/* Dynamic Sections Repeater */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Page Sections ({sections.length})
              </h2>
              <p className="text-xs text-slate-500">
                Add, reorder, or remove structured content sections for this page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => addSection()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-700 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
            >
              <Plus size={14} /> Add section
            </button>
          </div>

          {/* Quick Preset Buttons for About Us */}
          {isAboutPage && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-xs font-medium text-slate-500">Quick presets:</span>
              {ABOUT_PRESETS.map((preset) => {
                const alreadyAdded = sections.some((s) => s.sectionKey === preset.key);
                return (
                  <button
                    key={preset.key}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => addSection(preset)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Plus size={11} /> {preset.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* Render Sections */}
          {sections.map((section, index) => (
            <Card
              key={section.clientKey}
              title={`Section ${index + 1}: ${section.title || "Untitled"}`}
              hint={`Key: ${section.sectionKey}`}
              action={
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={index === sections.length - 1}
                    onClick={() => moveSection(index, 1)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="rounded-md p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                    title="Delete section"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              }
            >
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Section Heading
                  <input
                    value={section.title}
                    onChange={(ev) => updateSection(index, { title: ev.target.value })}
                    className={input}
                    placeholder="Section Title"
                  />
                  {e[`section_${index}_title`] && (
                    <span className="mt-1 block text-xs font-normal text-red-600">
                      {e[`section_${index}_title`]}
                    </span>
                  )}
                </label>

                <div>
                  <RichTextEditor
                    compact
                    label="Section Text"
                    defaultValue={section.content}
                    onChange={(html) => updateSection(index, { content: html })}
                  />
                </div>

                <div>
                  <ImageUpload
                    name={`section_img_${section.clientKey}`}
                    label="Section Image (Optional)"
                    folder="general"
                    defaultValue={section.imageUrl}
                    onChange={(url) => updateSection(index, { imageUrl: url })}
                    serverError={e[`section_${index}_image`]}
                  />
                </div>
              </div>
            </Card>
          ))}

          {sections.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
              <p className="text-sm">No structured sections yet.</p>
              <button
                type="button"
                onClick={() => addSection()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
              >
                <Plus size={14} /> Add first section
              </button>
            </div>
          )}
        </div>

        {/* About Page Connected Modules (Why Choose Us & Team) */}
        {isAboutPage && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Connected Modules on About Page
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Sparkles size={20} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {whyUsCount} reasons active
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Why Choose Us</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Featured reasons and value pillars shown on the About Us page and homepage.
                </p>
                <Link
                  href="/admin/team?tab=why"
                  target="_blank"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800"
                >
                  Manage reasons <ExternalLink size={13} />
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Users size={20} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {teamCount} members active
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Our Team</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Leadership and team member profiles, bios, and designations.
                </p>
                <Link
                  href="/admin/team"
                  target="_blank"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800"
                >
                  Manage team <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* SEO Meta Fields */}
        <Card title="Search Engine Listing" hint="How this page appears on Google search results.">
          <SeoFields
            pageTitle={title}
            slug={slug}
            defaults={{
              metaTitle: initial?.metaTitle,
              metaDescription: initial?.metaDescription,
              metaKeywords: initial?.metaKeywords,
            }}
          />
        </Card>
      </div>

      {/* Sidebar Controls */}
      <div className="h-fit space-y-6 lg:sticky lg:top-6">
        <Card>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial ? initial.isActive : true}
              className="h-4 w-4 accent-teal-700"
            />
            Active (visible on the website)
          </label>
          {isSystem && (
            <p className="text-xs text-slate-400">
              Default system pages start hidden until published.
            </p>
          )}

          {state?.message && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              disabled={pending}
              className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save page"}
            </button>
            <Link
              href="/admin/pages"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </Card>
      </div>
    </form>
  );
}
