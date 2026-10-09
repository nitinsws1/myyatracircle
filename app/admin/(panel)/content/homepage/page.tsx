import Link from "next/link";
import { ChevronRight, Pencil, Plus, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HOME_SECTIONS, HOME_SECTION_KEYS, timeAgo, youtubeId } from "@/lib/content-config";
import DeleteButton from "@/components/admin/DeleteButton";
import MoveButtons from "@/components/admin/MoveButtons";
import SectionRow from "@/components/admin/SectionRow";
import ToggleForm from "@/components/admin/ToggleForm";
import {
  createDefaultSections, deleteHero, moveHero, moveSection, saveSectionText, toggleHero, toggleSection,
} from "../actions";

function HeroPreview({ url, type }: { url: string; type: string }) {
  const id = type === "youtube" ? youtubeId(url) : null;
  if (id) return <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />;
  if (type === "video") return <video src={url} muted preload="metadata" className="h-full w-full object-cover" />;
  return <img src={url} alt="" className="h-full w-full object-cover" />;
}

export default async function HomepageManagerPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const active = tab === "hero" ? "hero" : "sections";

  const [sections, banners, stamp, counts] = await Promise.all([
    prisma.homepageSection.findMany({ orderBy: [{ sortOrder: "asc" }, { key: "asc" }] }),
    prisma.heroBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.siteSetting.findUnique({ where: { key: "homepage.updatedAt" } }),
    Promise.all([
      prisma.heroBanner.count({ where: { isActive: true } }),
      prisma.destination.count({ where: { isFeatured: true, status: "PUBLISHED" } }),
      prisma.tourPackage.count({ where: { isFeatured: true, status: "PUBLISHED" } }),
      prisma.experience.count({ where: { isFeatured: true, status: "PUBLISHED" } }),
      prisma.whyUsItem.count({ where: { isActive: true } }),
      prisma.testimonial.count({ where: { isApproved: true, isFeatured: true } }),
      prisma.blog.count({ where: { isFeatured: true, status: "PUBLISHED" } }),
    ]),
  ]);
  const itemCount: Record<string, number> = Object.fromEntries(
    ["hero", "featuredDestinations", "featuredPackages", "experiences", "whyUs", "testimonials", "blogs"].map((k, i) => [k, counts[i]])
  );
  const missing = HOME_SECTION_KEYS.filter((k) => !sections.some((s) => s.key === k));

  const tabs = [
    { key: "sections", label: "Sections", href: "/admin/content/homepage", count: sections.length },
    { key: "hero", label: "Hero banners", href: "/admin/content/homepage?tab=hero", count: banners.length },
  ];

  return (
    <>
      <nav className="mb-2 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/admin/content" className="hover:text-teal-700">Pages & Content</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">Homepage</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Homepage</h1>
          <p className="text-sm text-slate-500">
            Last changed {timeAgo(stamp?.value ? new Date(stamp.value) : null).toLowerCase()}. Every change here is saved straight away.
          </p>
        </div>
        {active === "hero" && (
          <Link href="/admin/content/homepage/hero/new"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            <Plus size={16} /> Add banner
          </Link>
        )}
      </div>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
              t.key === active ? "border-teal-700 text-teal-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t.label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t.count}</span>
          </Link>
        ))}
      </div>

      {active === "sections" ? (
        <div className="mt-6 max-w-4xl space-y-4">
          {missing.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 px-5 py-4">
              <p className="text-sm text-teal-900">
                {missing.length} homepage section{missing.length === 1 ? " is" : "s are"} not set up yet.
              </p>
              <form action={createDefaultSections}>
                <button className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
                  <Sparkles size={15} /> Set up default sections
                </button>
              </form>
            </div>
          )}

          <p className="text-sm text-slate-500">
            Use the arrows to change the order of the sections on the homepage, and the switch to show or hide a whole section.
          </p>

          {sections.map((s, i) => {
            const meta = HOME_SECTIONS[s.key];
            if (!meta) return null;
            const n = itemCount[s.key] ?? 0;
            return (
              <section key={s.key} className={`rounded-xl border bg-white p-5 shadow-sm ${s.isVisible ? "border-slate-200" : "border-slate-200 opacity-70"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">{i + 1}</span>
                      <h2 className="text-base font-semibold text-slate-900">{meta.label}</h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {meta.note} &middot; {n} item{n === 1 ? "" : "s"} showing{" "}
                      {s.isVisible && n === 0 && <span className="text-amber-600">(nothing to show yet, the section will be empty)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <MoveButtons up={moveSection.bind(null, s.key, -1)} down={moveSection.bind(null, s.key, 1)}
                      disableUp={i === 0} disableDown={i === sections.length - 1} />
                    <ToggleForm action={toggleSection.bind(null, s.key)} on={s.isVisible} onLabel="Visible" offLabel="Hidden" title="Click to change" />
                  </div>
                </div>

                {s.key !== "hero" && (
                  <div className="mt-4">
                    <SectionRow action={saveSectionText.bind(null, s.key)} title={s.title ?? ""} subtitle={s.subtitle ?? ""} />
                  </div>
                )}

                <Link href={meta.manage.href} className="mt-4 inline-block text-sm text-teal-700 hover:underline">
                  {meta.manage.label} &rarr;
                </Link>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 max-w-4xl">
          <p className="mb-4 text-sm text-slate-500">
            The slider at the top of the homepage. Banners show in this order, up to 8. {counts[0]} of {banners.length} active.
          </p>
          <ul className="space-y-3">
            {banners.map((b, i) => (
              <li key={b.id} className={`flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${b.isActive ? "" : "opacity-70"}`}>
                <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <HeroPreview url={b.mediaUrl} type={b.mediaType} />
                  <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] uppercase text-white">{b.mediaType}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{b.heading || "(no heading)"}</p>
                  <p className="truncate text-sm text-slate-500">{b.subHeading || "No sub-heading"}</p>
                  {b.ctaText && <p className="mt-1 text-xs text-slate-400">Button: {b.ctaText} &rarr; {b.ctaUrl}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <MoveButtons up={moveHero.bind(null, b.id, -1)} down={moveHero.bind(null, b.id, 1)}
                    disableUp={i === 0} disableDown={i === banners.length - 1} />
                  <ToggleForm action={toggleHero.bind(null, b.id)} on={b.isActive} onLabel="Active" offLabel="Hidden" title="Click to change" />
                  <Link href={`/admin/content/homepage/hero/${b.id}`}
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit"><Pencil size={16} /></Link>
                  <DeleteButton action={deleteHero.bind(null, b.id)} message="Delete this banner?" />
                </div>
              </li>
            ))}
            {banners.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-400">
                No banners yet. Click "Add banner" to create the first slide.
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
