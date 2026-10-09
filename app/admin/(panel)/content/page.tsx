import Link from "next/link";
import {
  Compass, FileText, Globe, HelpCircle, LayoutTemplate, Link2, MapPin, MessageSquareQuote,
  Newspaper, Package, Phone, Search, Sparkles, type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PUBLIC_PAGES, timeAgo } from "@/lib/content-config";
import { SETTING_KEYS } from "@/lib/settings-config";

const PAGE_ICONS: Record<string, LucideIcon> = {
  destinations: MapPin, packages: Package, experiences: Compass, blogs: Newspaper,
  testimonials: MessageSquareQuote, faqs: HelpCircle, contact: Phone, "customized-holidays": Sparkles,
};

type CardData = { icon: LucideIcon; title: string; meta: string; updated: Date | null; href: string };

function Card({ icon: Icon, title, meta, updated, href }: CardData) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-teal-700"><Icon size={20} /></div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{meta}</span>
        <span>Updated {timeAgo(updated).toLowerCase()}</span>
      </div>
      <Link href={href}
        className="mt-4 block rounded-lg border border-slate-300 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">
        Manage
      </Link>
    </div>
  );
}

const latest = (dates: Date[]) => (dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null);

export default async function ContentHubPage() {
  const [sectionCount, homeStamp, pageRows, settingRows, cmsPages, socialCount] = await Promise.all([
    prisma.homepageSection.count(),
    prisma.siteSetting.findUnique({ where: { key: "homepage.updatedAt" } }),
    prisma.siteSetting.findMany({ where: { key: { startsWith: "page." } }, select: { key: true, updatedAt: true } }),
    prisma.siteSetting.findMany({ where: { key: { in: [...SETTING_KEYS] } }, select: { updatedAt: true } }),
    prisma.page.findMany({ select: { updatedAt: true } }),
    prisma.socialLink.count(),
  ]);

  const settingsUpdated = latest(settingRows.map((r) => r.updatedAt));
  const homeUpdated = homeStamp?.value ? new Date(homeStamp.value) : null;

  const global: CardData[] = [
    { icon: Globe, title: "Header & Branding", meta: "Logo, favicon, site name", updated: settingsUpdated, href: "/admin/settings" },
    { icon: Phone, title: "Contact Details", meta: "Phone, email, address, map", updated: settingsUpdated, href: "/admin/settings" },
    { icon: Link2, title: "Footer & Social Links", meta: `Footer text, ${socialCount} link${socialCount === 1 ? "" : "s"}`, updated: settingsUpdated, href: "/admin/settings" },
    { icon: Search, title: "Default SEO & Analytics", meta: "Fallback title, tracking ID", updated: settingsUpdated, href: "/admin/settings" },
  ];

  const pages: CardData[] = [
    { icon: LayoutTemplate, title: "Homepage", meta: `${sectionCount} section${sectionCount === 1 ? "" : "s"}`, updated: homeUpdated, href: "/admin/content/homepage" },
    { icon: FileText, title: "About Us & Policies", meta: `${cmsPages.length} page${cmsPages.length === 1 ? "" : "s"}`, updated: latest(cmsPages.map((p) => p.updatedAt)), href: "/admin/pages" },
    ...PUBLIC_PAGES.map((p) => ({
      icon: PAGE_ICONS[p.slug] ?? FileText,
      title: p.label,
      meta: "Header, banner & SEO",
      updated: latest(pageRows.filter((r) => r.key.startsWith(`page.${p.slug}.`)).map((r) => r.updatedAt)),
      href: `/admin/content/page/${p.slug}`,
    })),
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pages & Content</h1>
        <p className="text-sm text-slate-500">Manage all public site content and media from one place.</p>
      </div>

      <h2 className="mt-8 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Global Components</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {global.map((c) => <Card key={c.title} {...c} />)}
      </div>

      <h2 className="mt-10 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Public Pages</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((c) => <Card key={c.title} {...c} />)}
      </div>
    </>
  );
}
