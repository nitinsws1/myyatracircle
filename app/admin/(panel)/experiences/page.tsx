import Link from "next/link";
import { Plus, Pencil, MapPin, Star, Sparkles, Layers, ArrowUpDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cardImage } from "@/lib/media";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteExperience } from "./actions";

export default async function ExperiencesPage() {
  const experiences = await prisma.experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { destinations: { include: { destination: { select: { name: true } } } } },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Experiences</h1>
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200/60">
              {experiences.length} total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage adventure packages, tours, and unique activities for travelers.
          </p>
        </div>
        <Link
          href="/admin/experiences/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 hover:bg-teal-800 transition-all active:scale-[0.98]"
        >
          <Plus size={18} /> New experience
        </Link>
      </div>

      {/* Content Grid / Empty State */}
      {experiences.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-4">
            <Sparkles size={28} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No experiences found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Get started by creating your first travel experience or tour package for your users.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/experiences/new"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-all"
            >
              <Plus size={16} /> Create new experience
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {experiences.map((x) => {
            const img = cardImage(x.thumbnailImage, x.heroImage);
            const names = x.destinations.map((d) => d.destination.name);

            return (
              <div
                key={x.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                {/* Card Image Header */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt={x.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 bg-slate-100">
                      <Layers size={32} />
                    </div>
                  )}

                  {/* Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />

                  {/* Top Status & Featured Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-md ${
                        x.status === "PUBLISHED"
                          ? "bg-emerald-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}
                    >
                      {x.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>

                    {x.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 text-slate-900 px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-md">
                        <Star size={12} className="fill-slate-900" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Title over Image Bottom */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white drop-shadow-sm line-clamp-1">
                      {x.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body (Compact & Optimized Space) */}
                <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                  {/* Destinations Row */}
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-400 shrink-0 font-medium">
                      <MapPin size={14} className="text-teal-600" />
                      <span>Destinations:</span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1 max-w-[200px]">
                      {names.length === 0 ? (
                        <span className="text-slate-400 italic">None</span>
                      ) : (
                        names.map((name, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 truncate max-w-[120px]"
                            title={name}
                          >
                            {name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Footer Action & Order Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <ArrowUpDown size={13} className="text-slate-400" />
                      <span>Order: <strong className="text-slate-700">{x.sortOrder ?? 0}</strong></span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/experiences/${x.id}`}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton
                        action={deleteExperience.bind(null, x.id)}
                        message={`Delete "${x.name}"? Its highlights and gallery will be deleted too.`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}