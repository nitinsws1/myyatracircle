import Link from "next/link";
import { Lock, Pencil, Plus, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PAGE_SECTIONS, SYSTEM_PAGES, isSystemSlug } from "@/lib/cms-config";
import { fmtDateTime } from "@/lib/inquiry-config";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleForm from "@/components/admin/ToggleForm";
import { createDefaultPages, deletePage, togglePage } from "./actions";

export default async function PagesPage() {
  const rows = await prisma.page.findMany({ include: { _count: { select: { sections: true } } } });

  // default pages first (in their usual order), then custom pages A to Z
  const order = (slug: string) => {
    const i = SYSTEM_PAGES.findIndex((p) => p.slug === slug);
    return i === -1 ? 999 : i;
  };
  const pages = [...rows].sort((a, b) => order(a.slug) - order(b.slug) || a.title.localeCompare(b.title));
  const missing = SYSTEM_PAGES.filter((sp) => !rows.some((p) => p.slug === sp.slug));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pages (CMS)</h1>
          <p className="text-sm text-slate-500">About Us, policies and any extra pages you want on the website.</p>
        </div>
        <Link href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          <Plus size={16} /> New page
        </Link>
      </div>

      {missing.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-teal-900">
              {missing.length} default page{missing.length === 1 ? "" : "s"} not created yet
            </p>
            <p className="text-xs text-teal-800">{missing.map((m) => m.title).join(", ")}. They start hidden until you add content.</p>
          </div>
          <form action={createDefaultPages}>
            <button className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
              <Sparkles size={15} /> Create default pages
            </button>
          </form>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="px-4 py-3 font-medium">Content</th>
              <th className="px-4 py-3 font-medium">Last updated</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pages.map((p) => {
              const system = isSystemSlug(p.slug);
              const total = PAGE_SECTIONS[p.slug]?.length ?? 0;
              const empty = !p.content && p._count.sections === 0;
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{p.title}</p>
                      {system && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                          <Lock size={10} /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {empty ? (
                      <span className="text-amber-600">Empty</span>
                    ) : total > 0 ? (
                      `${p._count.sections} of ${total} sections`
                    ) : (
                      "Written"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDateTime(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <ToggleForm action={togglePage.bind(null, p.id)} on={p.isActive} onLabel="Active" offLabel="Hidden" title="Click to change" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/pages/${p.id}`}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                        <Pencil size={16} />
                      </Link>
                      {!system && <DeleteButton action={deletePage.bind(null, p.id)} message={`Delete the page "${p.title}"?`} />}
                    </div>
                  </td>
                </tr>
              );
            })}
            {pages.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                No pages yet. Click "Create default pages" or "New page".
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
