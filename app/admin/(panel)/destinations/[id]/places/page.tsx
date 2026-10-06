import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { cardImage } from "@/lib/media";
import { deletePlace } from "./actions";

export default async function PlacesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destinationId = Number(id);
  if (!Number.isInteger(destinationId)) notFound();

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    include: { places: { orderBy: [{ sortOrder: "asc" }, { id: "desc" }] } },
  });
  if (!destination) notFound();

  return (
    <>
      <nav className="mb-2 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/admin/destinations" className="hover:text-teal-700">Destinations</Link>
        <ChevronRight size={14} />
        <Link href={`/admin/destinations/${destination.id}`} className="hover:text-teal-700">{destination.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">Places</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Places in {destination.name}</h1>
          <p className="text-sm text-slate-500">{destination.places.length} total</p>
        </div>
        <Link href={`/admin/destinations/${destination.id}/places/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          <Plus size={16} /> Add place
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Place</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {destination.places.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {cardImage(p.thumbnailImage, p.heroImage) ? (
                      <img src={cardImage(p.thumbnailImage, p.heroImage)!} alt="" className="h-10 w-14 rounded-md object-cover" />
                    ) : (
                      <div className="h-10 w-14 rounded-md bg-slate-100" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400">/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.sortOrder}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {p.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/destinations/${destination.id}/places/${p.id}`}
                      className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton action={deletePlace.bind(null, destination.id, p.id)}
                      message={`Delete "${p.name}"?`} />
                  </div>
                </td>
              </tr>
            ))}
            {destination.places.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                No places yet. Click &quot;Add place&quot; to add the first one.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
