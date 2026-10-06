import Link from "next/link";
import { ChevronRight, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteCategory } from "./actions";

export default async function BlogCategoriesPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { blogs: true } } },
  });

  return (
    <>
      <nav className="mb-2 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/admin/blogs" className="hover:text-teal-700">Blogs</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">Categories</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Blog categories</h1>
          <p className="text-sm text-slate-500">{categories.length} total. Related blogs on the website are matched by category.</p>
        </div>
        <Link href="/admin/blogs/categories/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          <Plus size={16} /> New category
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Blogs</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3 text-slate-500">/{c.slug}</td>
                <td className="px-4 py-3 text-slate-600">{c._count.blogs}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/blogs/categories/${c.id}`}
                      className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton action={deleteCategory.bind(null, c.id)}
                      message={`Delete the category "${c.name}"? Its ${c._count.blogs} blog(s) will stay but become uncategorized.`} />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                No categories yet. Click "New category" to add the first one.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
