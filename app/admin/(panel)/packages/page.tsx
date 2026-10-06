import Link from "next/link";
import { Plus, Pencil, MapPin, Calendar, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cardImage } from "@/lib/media";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePackage } from "./actions";

export default async function PackagesPage() {
  const packages = await prisma.tourPackage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { destinations: { include: { destination: { select: { name: true } } } } },
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-medium tracking-tight text-slate-900">Tour Packages</h1>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
              {packages.length} {packages.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Manage your available tour packages.</p>
        </div>
        <Link href="/admin/packages/new"
          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800">
          <Plus size={14} /> New package
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No packages yet. Click &quot;New package&quot; to add the first one.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => {
            const img = cardImage(p.thumbnailImage, p.heroImage);
            const names = p.destinations.map((d) => d.destination.name);
            const durationString = p.durationDays != null || p.durationNights != null
              ? `${p.durationDays ?? "-"}D / ${p.durationNights ?? "-"}N`
              : "-";
            const destinationsString = names.length === 0 ? "No destinations" : names.join(", ");

            return (
              <div key={p.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                  {img ? (
                    <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">No Image</div>
                  )}
                  
                  {/* Top-Right Delete Action */}
                  <div className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-md transition hover:bg-white">
                    <DeleteButton 
                      action={deletePackage.bind(null, p.id)}
                      message={`Delete "${p.name}"? Its itinerary and gallery will be deleted too. Inquiries are kept.`} 
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="mt-3 flex flex-1 flex-col px-1">
                  
                  {/* Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-base font-medium text-slate-800" title={p.name}>
                      {p.name}
                    </h3>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {p.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Location & Duration Info */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="line-clamp-1">{destinationsString}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{durationString}</span>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div>
                      {p.isFeatured && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                          <Star size={14} className="fill-current" />
                          <span>Featured</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Minimal Edit Button */}
                    <Link href={`/admin/packages/${p.id}`}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800"
                      title="Edit Package"
                    >
                      <Pencil size={16} />
                    </Link>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}