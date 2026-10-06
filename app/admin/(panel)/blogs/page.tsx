import Link from "next/link";
import Script from "next/script";
import { Plus, Pencil, Search, Tags, Calendar, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteBlog } from "./actions";

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) || "";
  
  const blogs = await prisma.blog.findMany({
    where: q ? {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } }
      ]
    } : {},
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    include: { category: { select: { name: true } } },
  });
  
  const now = new Date();

  return (
    <>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-medium tracking-tight text-slate-900">Blogs</h1>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                <span id="blog-count">{blogs.length}</span>{" "}
                <span id="blog-count-label">{blogs.length === 1 ? "entry" : "entries"}</span>
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Stories that take you somewhere.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/blogs/categories"
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50">
              <Tags size={14} /> Categories
            </Link>
            <Link href="/admin/blogs/new"
              className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800">
              <Plus size={14} /> New blog
            </Link>
          </div>
        </header>

        <section className="max-w-xl" aria-label="Search blogs">
          <label htmlFor="blog-search" className="sr-only">Search blogs by name or publish date</label>
          <div className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm transition focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600">
            <Search size={16} aria-hidden="true" className="shrink-0 text-slate-400" />
            <input
              id="blog-search"
              type="search"
              defaultValue={q}
              autoComplete="off"
              aria-controls="blog-grid"
              placeholder="Search by blog name, date, month, or year..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </section>

        {blogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            {q ? `No blogs found matching "${q}".` : 'No blogs yet. Click "New blog" to write the first one.'}
          </div>
        ) : (
          <>
            <div id="blog-grid" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((b) => {
                const scheduled = b.status === "PUBLISHED" && b.publishedAt && b.publishedAt > now;
                const badge = scheduled
                  ? ["Scheduled", "bg-sky-50 text-sky-600 border-sky-100"]
                  : b.status === "PUBLISHED"
                  ? ["Published", "bg-emerald-50 text-emerald-600 border-emerald-100"]
                  : ["Draft", "bg-amber-50 text-amber-600 border-amber-100"];
                const searchDate = b.publishedAt
                  ? [
                      fmt(b.publishedAt),
                      b.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
                      b.publishedAt.toLocaleDateString("en-CA"),
                      b.publishedAt.toLocaleDateString("en-IN", { month: "long" }),
                      b.publishedAt.toLocaleDateString("en-IN", { month: "short" }),
                      b.publishedAt.toLocaleDateString("en-IN", { month: "numeric", year: "numeric" }),
                    ].join(" ")
                  : "";

                return (
                  <div 
                    key={b.id} 
                    data-blog-card
                    data-search={`${b.title} ${b.slug} ${searchDate}`.toLocaleLowerCase()}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                      {b.featuredImage ? (
                        <img src={b.featuredImage} alt={b.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <Tags size={36} />
                        </div>
                      )}

                      {/* Top-Right Delete Action */}
                      <div className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-md transition hover:bg-white">
                        <DeleteButton action={deleteBlog.bind(null, b.id)} message={`Delete "${b.title}"?`} />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="mt-3 flex flex-1 flex-col px-1">
                      
                      {/* Title & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-base font-medium text-slate-800" title={b.title}>
                          {b.title}
                        </h3>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge[1]}`}>
                          {badge[0]}
                        </span>
                      </div>

                      {/* Category & Date */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Tags size={14} className="text-slate-400" />
                          <span className="line-clamp-1">{b.category?.name ?? "Uncategorized"}</span>
                        </div>
                        {b.publishedAt && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{fmt(b.publishedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Row */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div>
                          {b.isFeatured && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                              <Star size={14} className="fill-current" />
                              <span>Featured</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Minimal Edit Button */}
                        <Link href={`/admin/blogs/${b.id}`}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800"
                          title="Edit Blog"
                        >
                          <Pencil size={16} />
                        </Link>
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </div>
            <div id="blog-search-empty" hidden className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No blogs match your search. Try a different name, date, month, or year.
            </div>
          </>
        )}
        <Script id="blog-live-search" strategy="afterInteractive">{`
          (() => {
            if (document.documentElement.dataset.blogSearchReady) return;
            document.documentElement.dataset.blogSearchReady = "true";

            document.addEventListener("input", (event) => {
              const input = event.target;
              if (!(input instanceof HTMLInputElement) || input.id !== "blog-search") return;

              const count = document.getElementById("blog-count");
              const countLabel = document.getElementById("blog-count-label");
              const emptyState = document.getElementById("blog-search-empty");
              const cards = document.querySelectorAll("[data-blog-card]");
              if (!count || !countLabel) return;

              const query = input.value.trim().toLocaleLowerCase();
              let visible = 0;
              cards.forEach((card) => {
                const matches = card.dataset.search.includes(query);
                card.style.display = matches ? "" : "none";
                if (matches) visible += 1;
              });
              count.textContent = String(visible);
              countLabel.textContent = visible === 1 ? "entry" : "entries";
              if (emptyState) emptyState.hidden = visible > 0;
            });
          })();
        `}</Script>
      </div>
    </>
  );
}