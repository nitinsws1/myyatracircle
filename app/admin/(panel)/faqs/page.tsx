import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleForm from "@/components/admin/ToggleForm";
import { deleteFaq, toggleFaq } from "./actions";

export default async function FaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-slate-900">FAQs</h1>
          <p className="text-sm text-slate-500">{faqs.length} total</p>
        </div>
        <Link href="/admin/faqs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          <Plus size={16} /> New FAQ
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {faqs.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="max-w-xl px-4 py-3 font-medium text-slate-900">{f.question}</td>
                <td className="px-4 py-3 text-slate-600">{f.sortOrder}</td>
                <td className="px-4 py-3">
                  <ToggleForm action={toggleFaq.bind(null, f.id)} on={f.isActive}
                    onLabel="Active" offLabel="Hidden" title="Click to change" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/faqs/${f.id}`}
                      className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton action={deleteFaq.bind(null, f.id)} message="Delete this FAQ?" />
                  </div>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                No FAQs yet. Click &quot;New FAQ&quot; to add the first one.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
