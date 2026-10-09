import Link from "next/link";
import { Check, Clock, FileText, Pencil, Star, type LucideIcon } from "lucide-react";
import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { STATE_LABEL, STATE_STYLE, blogState, fmtBlogDate } from "@/lib/blog-config";
import BlogHeader from "@/components/admin/BlogHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import ListFilters from "@/components/admin/ListFilters";
import Pager from "@/components/admin/Pager";
import { deleteBlog } from "./actions";

const PER_PAGE = 15;
const insensitive = "insensitive" as const;
type SP = { tab?: string; q?: string; status?: string; category?: string; page?: string };

function Thumb({ src }: { src: string | null }) {
  return src ? <img src={src} alt="" className="h-10 w-14 rounded-md object-cover" /> : <div className="h-10 w-14 rounded-md bg-slate-100" />;
}

export default async function BlogsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tab = sp.tab === "posts" ? "posts" : "dashboard";
  const now = new Date();

  return (
    <>
      <BlogHeader active={tab} />
      {tab === "dashboard" ? <Dashboard now={now} /> : <Posts sp={sp} now={now} />}
    </>
  );
}

// ======================= DASHBOARD =======================
async function Dashboard({ now }: { now: Date }) {
  const [total, published, scheduled, drafts, recent, categories] = await Promise.all([
    prisma.blog.count(),
    prisma.blog.count({ where: { status: "PUBLISHED", OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] } }),
    prisma.blog.count({ where: { status: "PUBLISHED", publishedAt: { gt: now } } }),
    prisma.blog.count({ where: { status: "DRAFT" } }),
    prisma.blog.findMany({ orderBy: { updatedAt: "desc" }, take: 5, include: { category: { select: { name: true } } } }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { blogs: true } } } }),
  ]);

  const stats: { label: string; value: number; icon: LucideIcon; tile: string }[] = [
    { label: "Total posts", value: total, icon: FileText, tile: "bg-slate-100 text-slate-600" },
    { label: "Published", value: published, icon: Check, tile: "bg-emerald-50 text-emerald-600" },
    { label: "Scheduled", value: scheduled, icon: Clock, tile: "bg-sky-50 text-sky-600" },
    { label: "Drafts", value: drafts, icon: Pencil, tile: "bg-amber-50 text-amber-600" },
  ];

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tile }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tile}`}><Icon size={20} /></div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent posts</h2>
            <Link href="/admin/blogs?tab=posts" className="text-sm text-teal-700 hover:underline">View all &rarr;</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recent.map((b) => {
              const state = blogState(b.status, b.publishedAt, now);
              return (
                <li key={b.id}>
                  <Link href={`/admin/blogs/${b.id}`} className="flex items-center gap-4 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                    <Thumb src={b.featuredImage} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{b.title}</p>
                      <p className="truncate text-xs text-slate-400">
                        {[b.category?.name, b.authorName, b.publishedAt ? fmtBlogDate(b.publishedAt) : null].filter(Boolean).join(" · ") || "No details yet"}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${STATE_STYLE[state]}`}>{STATE_LABEL[state]}</span>
                  </Link>
                </li>
              );
            })}
            {recent.length === 0 && <li className="py-8 text-center text-sm text-slate-400">No posts yet. Click "New post" to write the first one.</li>}
          </ul>
        </section>

        <section className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Categories</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-800">{c.name}</span>
                <span className="text-xs text-slate-400">{c._count.blogs} post{c._count.blogs === 1 ? "" : "s"}</span>
              </li>
            ))}
            {categories.length === 0 && <li className="py-4 text-sm text-slate-400">No categories yet.</li>}
          </ul>
          <Link href="/admin/blogs/categories" className="mt-3 inline-block text-sm text-teal-700 hover:underline">Manage categories &rarr;</Link>
        </section>
      </div>
    </>
  );
}

// ======================= POSTS (search + filters) =======================
async function Posts({ sp, now }: { sp: SP; now: Date }) {
  const q = sp.q?.trim() || undefined;
  const status = ["published", "scheduled", "draft"].includes(sp.status ?? "") ? sp.status : undefined;
  const category = sp.category || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const and: Prisma.BlogWhereInput[] = [];
  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: insensitive } },
        { shortDescription: { contains: q, mode: insensitive } },
        { authorName: { contains: q, mode: insensitive } },
        { category: { name: { contains: q, mode: insensitive } } },
        { tags: { some: { name: { contains: q, mode: insensitive } } } },
      ],
    });
  }
  if (status === "published") and.push({ status: "PUBLISHED", OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] });
  if (status === "scheduled") and.push({ status: "PUBLISHED", publishedAt: { gt: now } });
  if (status === "draft") and.push({ status: "DRAFT" });
  if (category === "none") and.push({ categoryId: null });
  else if (category && Number.isInteger(Number(category))) and.push({ categoryId: Number(category) });
  const where: Prisma.BlogWhereInput = and.length ? { AND: and } : {};

  const [blogs, total, categories] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: { select: { name: true } }, tags: { select: { name: true } } },
    }),
    prisma.blog.count({ where }),
    prisma.blogCategory.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const hrefFor = (p: number) => {
    const params = new URLSearchParams({ tab: "posts" });
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    params.set("page", String(p));
    return `/admin/blogs?${params}`;
  };

  return (
    <>
      <ListFilters action="/admin/blogs" hidden={{ tab: "posts" }} q={q} total={total}
        placeholder="Search title, author, category or tag"
        selects={[
          { name: "status", value: status, allLabel: "All statuses", options: [
            { value: "published", label: "Published" }, { value: "scheduled", label: "Scheduled" }, { value: "draft", label: "Draft" } ] },
          { name: "category", value: category, allLabel: "All categories", options: [
            ...categories.map((c) => ({ value: String(c.id), label: c.name })), { value: "none", label: "No category" } ] },
        ]} />

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Post</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Publish date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {blogs.map((b) => {
              const state = blogState(b.status, b.publishedAt, now);
              return (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Thumb src={b.featuredImage} />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-medium text-slate-900">
                          <span className="truncate">{b.title}</span>
                          {b.isFeatured && <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          /{b.slug}{b.tags.length > 0 && ` · ${b.tags.map((t) => t.name).join(", ")}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.category?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{b.authorName ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{b.publishedAt ? fmtBlogDate(b.publishedAt) : "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLE[state]}`}>{STATE_LABEL[state]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/blogs/${b.id}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton action={deleteBlog.bind(null, b.id)} message={`Delete "${b.title}"?`} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {blogs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                {q || status || category ? "No posts match your search." : 'No posts yet. Click "New post" to write the first one.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} hrefFor={hrefFor} />
    </>
  );
}
