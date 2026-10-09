import Link from "next/link";
import { Plus } from "lucide-react";

const TABS = [
  { key: "dashboard", label: "Dashboard", href: "/admin/blogs" },
  { key: "posts", label: "Posts", href: "/admin/blogs?tab=posts" },
  { key: "categories", label: "Categories", href: "/admin/blogs/categories" },
  { key: "tags", label: "Tags", href: "/admin/blogs/tags" },
] as const;

export default function BlogHeader({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-500">Manage your travel stories, categories and tags.</p>
        </div>
        <Link href="/admin/blogs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          <Plus size={16} /> New post
        </Link>
      </div>
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => (
          <Link key={t.key} href={t.href}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${
              t.key === active ? "border-teal-700 text-teal-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t.label}
          </Link>
        ))}
      </div>
    </>
  );
}
