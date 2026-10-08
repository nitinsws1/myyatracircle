import { prisma } from "@/lib/prisma";
import BlogHeader from "@/components/admin/BlogHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import ListFilters from "@/components/admin/ListFilters";
import TagRow from "@/components/admin/TagRow";
import { createTag, deleteTag, updateTag } from "./actions";

export default async function BlogTagsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() || undefined;

  const tags = await prisma.tag.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    orderBy: { name: "asc" },
    include: { _count: { select: { blogs: true } } },
  });

  return (
    <>
      <BlogHeader active="tags" />

      <div className="mt-6 grid max-w-4xl gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Add a tag</h2>
          <p className="mt-0.5 text-sm text-slate-500">Tags can also be created while writing a post.</p>
          <div className="mt-4 flex"><TagRow isNew action={createTag} /></div>
        </section>

        <section>
          <ListFilters action="/admin/blogs/tags" q={q} total={tags.length} placeholder="Search tags" />

          <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
            {tags.map((t) => (
              <li key={t.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
                <TagRow action={updateTag.bind(null, t.id)} name={t.name} />
                <span className="w-20 pt-2 text-xs text-slate-400">{t._count.blogs} post{t._count.blogs === 1 ? "" : "s"}</span>
                <DeleteButton action={deleteTag.bind(null, t.id)}
                  message={`Delete the tag "${t.name}"? It will be removed from ${t._count.blogs} post(s).`} />
              </li>
            ))}
            {tags.length === 0 && (
              <li className="px-5 py-12 text-center text-sm text-slate-400">{q ? "No tags match your search." : "No tags yet."}</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
