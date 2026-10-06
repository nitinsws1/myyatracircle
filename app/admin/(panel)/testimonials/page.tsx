import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleForm from "@/components/admin/ToggleForm";
import { deleteTestimonial, toggleTestimonial } from "./actions";

export default async function TestimonialsPage() {
  const items = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Testimonials</h1>
          <p className="text-sm text-slate-500">
            {items.length} total, {items.filter((t) => t.isApproved).length} approved
          </p>
        </div>
        <Link href="/admin/testimonials/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          <Plus size={16} /> New testimonial
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Traveler</th>
              <th className="px-4 py-3 font-medium">Feedback</th>
              <th className="px-4 py-3 font-medium">Approved</th>
              <th className="px-4 py-3 font-medium">Homepage</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {t.imageUrl ? (
                      <img src={t.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                        {t.travelerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{t.travelerName}</p>
                      <p className="text-xs text-slate-400">{t.location || "-"}</p>
                    </div>
                  </div>
                </td>
                <td className="max-w-md px-4 py-3 text-slate-600">
                  <p className="line-clamp-2">{t.feedback}</p>
                </td>
                <td className="px-4 py-3">
                  <ToggleForm action={toggleTestimonial.bind(null, t.id, "isApproved")}
                    on={t.isApproved} onLabel="Approved" offLabel="Pending" title="Click to change" />
                </td>
                <td className="px-4 py-3">
                  <ToggleForm action={toggleTestimonial.bind(null, t.id, "isFeatured")}
                    on={t.isFeatured} onLabel="Featured" offLabel="Not featured"
                    disabled={!t.isApproved} title={t.isApproved ? "Click to change" : "Approve it first"} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/testimonials/${t.id}`}
                      className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton action={deleteTestimonial.bind(null, t.id)}
                      message={`Delete the testimonial from "${t.travelerName}"?`} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                No testimonials yet. Click "New testimonial" to add the first one.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
