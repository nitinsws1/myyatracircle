import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BlogHeader from "@/components/admin/BlogHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import ListFilters from "@/components/admin/ListFilters";
import { deleteCategory } from "./actions";

export default async function BlogCategoriesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() || undefined;

  const categories = await prisma.blogCategory.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    orderBy: { name: "asc" },
    include: { _count: { select: { blogs: true } } },
  });

  return (
    <>
      <BlogHeader active="categories" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Related posts on the website are matched by category.</p>
        <Link href="/admin/blogs/categories/new"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          <Plus size={16} /> New category
        </Link>
      </div>

      <ListFilters action="/admin/blogs/categories" q={q} total={categories.length} placeholder="Search categories" />

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Posts</th>
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
                    <Link href={`/admin/blogs/categories/${c.id}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton action={deleteCategory.bind(null, c.id)}
                      message={`Delete the category "${c.name}"? Its ${c._count.blogs} post(s) will stay but become uncategorized.`} />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                {q ? "No categories match your search." : 'No categories yet. Click "New category" to add the first one.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
