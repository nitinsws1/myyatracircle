import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cardImage } from "@/lib/media";
import DeleteButton from "@/components/admin/DeleteButton";
import ListFilters from "@/components/admin/ListFilters";
import Pager from "@/components/admin/Pager";
import { deletePackage } from "./actions";

const PER_PAGE = 20;
const insensitive = "insensitive" as const;
type SP = { q?: string; status?: string; destination?: string; page?: string };

export default async function PackagesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const status = sp.status === "PUBLISHED" || sp.status === "DRAFT" ? sp.status : undefined;
  const destId = Number(sp.destination) || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const where = {
    ...(q ? { OR: [
      { name: { contains: q, mode: insensitive } },
      { slug: { contains: q, mode: insensitive } },
      { shortDescription: { contains: q, mode: insensitive } },
    ] } : {}),
    ...(status ? { status } : {}),
    ...(destId ? { destinations: { some: { destinationId: destId } } } : {}),
  };

  const [packages, total, destinations] = await Promise.all([
    prisma.tourPackage.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { destinations: { include: { destination: { select: { name: true } } } } },
    }),
    prisma.tourPackage.count({ where }),
    prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (destId) params.set("destination", String(destId));
    params.set("page", String(p));
    return `/admin/packages?${params}`;
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tour Packages</h1>
          <p className="text-sm text-slate-500">Create and manage the tours shown on the website.</p>
        </div>
        <Link href="/admin/packages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          <Plus size={16} /> New package
        </Link>
      </div>

      <ListFilters action="/admin/packages" q={q} total={total} placeholder="Search name, slug or description"
        selects={[
          { name: "status", value: status, allLabel: "All statuses", options: [{ value: "PUBLISHED", label: "Published" }, { value: "DRAFT", label: "Draft" }] },
          { name: "destination", value: destId ? String(destId) : undefined, allLabel: "All destinations",
            options: destinations.map((d) => ({ value: String(d.id), label: d.name })) },
        ]} />

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Destinations</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {packages.map((p) => {
              const img = cardImage(p.thumbnailImage, p.heroImage);
              const names = p.destinations.map((d) => d.destination.name);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {img ? <img src={img} alt="" className="h-10 w-14 rounded-md object-cover" /> : <div className="h-10 w-14 rounded-md bg-slate-100" />}
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.durationDays != null || p.durationNights != null ? `${p.durationDays ?? "-"}D / ${p.durationNights ?? "-"}N` : "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {names.length === 0 ? "-" : names.slice(0, 2).join(", ") + (names.length > 2 ? ` +${names.length - 2}` : "")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.isFeatured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {p.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/packages/${p.id}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton action={deletePackage.bind(null, p.id)}
                        message={`Delete "${p.name}"? Its itinerary and gallery will be deleted too. Inquiries are kept.`} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {packages.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                {q || status || destId ? "No packages match your search." : 'No packages yet. Click "New package" to add the first one.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} hrefFor={hrefFor} />
    </>
  );
}
