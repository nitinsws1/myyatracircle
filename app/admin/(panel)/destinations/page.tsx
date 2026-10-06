import Link from "next/link";
import Script from "next/script";
import { Plus, Pencil, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteDestination } from "./actions";

export default async function DestinationsPage() {
  const destinations = await prisma.destination.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { places: true } } },
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-medium tracking-tight text-slate-900">Destinations</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {destinations.length} total
            </span>
          </div>
          <p id="destination-count" aria-live="polite" className="mt-1 text-sm text-slate-500">
            {destinations.length} destinations in your collection
          </p>
        </div>
          <Link
            href="/admin/destinations/new"
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:self-auto"
          >
            <Plus size={17} /> New destination
          </Link>
      </header>

      <div className="max-w-xl">
        <label htmlFor="destination-search" className="sr-only">Search destinations</label>
        <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm transition focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/15">
          <Search size={18} aria-hidden="true" className="shrink-0 text-slate-400" />
          <input
            id="destination-search"
            type="search"
            autoComplete="off"
            aria-controls="destinations-table-body"
            placeholder="Search by destination, region, or state..."
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline">SEARCH</kbd>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Destination</th>
              <th className="px-4 py-3 font-medium">Region / State</th>
              <th className="px-4 py-3 font-medium">Places</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody id="destinations-table-body" className="divide-y divide-slate-100">
            {destinations.map((d) => (
              <tr
                key={d.id}
                data-destination-row
                data-search={`${d.name} ${d.region ?? ""} ${d.state ?? ""}`.toLocaleLowerCase()}
                className="hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {d.thumbnailImage ? (
                      // plain <img> for now; we switch to next/image when we add uploads
                      <img src={d.thumbnailImage} alt="" className="h-10 w-14 rounded-md object-cover" />
                    ) : (
                      <div className="h-10 w-14 rounded-md bg-slate-100" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{d.name}</p>
                      <p className="text-xs text-slate-400">/{d.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{[d.region, d.state].filter(Boolean).join(" / ") || "-"}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/destinations/${d.id}/places`}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700">
                    {d._count.places} · Manage
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{d.isFeatured ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    d.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {d.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/destinations/${d.id}`}
                      className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton action={deleteDestination.bind(null, d.id)}
                      message={`Delete "${d.name}"? Its places and gallery will be deleted too.`} />
                  </div>
                </td>
              </tr>
            ))}
            {destinations.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                No destinations yet. Click <span className="font-medium text-slate-600">New destination</span> to add the first one.
              </td></tr>
            ) : (
              <tr id="destination-search-empty" hidden>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  No destinations match your search. Try another name, region, or state.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Script id="destination-live-search" strategy="afterInteractive">{`
        (() => {
          const input = document.getElementById("destination-search");
          const count = document.getElementById("destination-count");
          const emptyState = document.getElementById("destination-search-empty");
          const rows = Array.from(document.querySelectorAll("[data-destination-row]"));
          if (!input || !count || rows.length === 0) return;

          const updateResults = () => {
            const query = input.value.trim().toLocaleLowerCase();
            let visible = 0;
            rows.forEach((row) => {
              const matches = row.dataset.search.includes(query);
              row.hidden = !matches;
              if (matches) visible += 1;
            });
            count.textContent = query
              ? visible + " of " + rows.length + " destinations match your search"
              : rows.length + " destinations in your collection";
            if (emptyState) emptyState.hidden = visible > 0;
          };

          input.addEventListener("input", updateResults);
        })();
      `}</Script>
    </div>
  );
}
