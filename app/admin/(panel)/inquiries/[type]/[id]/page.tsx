import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TYPE_LABEL, fmtDate, fmtDateTime, type Status } from "@/lib/inquiry-config";
import DeleteButton from "@/components/admin/DeleteButton";
import StatusSelect from "@/components/admin/StatusSelect";
import { deleteInquiry, updateInquiryStatus } from "../../actions";

type Field = [label: string, value: React.ReactNode];

export default async function InquiryDetailPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  let name = "", email = "", phone: string | null = null, status: Status = "NEW", createdAt = new Date();
  let fields: Field[] = [];

  if (type === "contact") {
    const r = await prisma.contactInquiry.findUnique({ where: { id: numId } });
    if (!r) notFound();
    ({ name, email, phone, status, createdAt } = r);
    fields = [["Country", r.country], ["Destination of interest", r.destinationOfInterest], ["Message", r.message]];
  } else if (type === "tour") {
    const r = await prisma.tourInquiry.findUnique({ where: { id: numId }, include: { package: { select: { id: true, name: true } } } });
    if (!r) notFound();
    ({ name, email, phone, status, createdAt } = r);
    fields = [
      ["Package", r.package
        ? <Link key="p" href={`/admin/packages/${r.package.id}`} className="text-teal-700 hover:underline">{r.package.name}</Link>
        : "(package was deleted)"],
      ["Message", r.message],
    ];
  } else if (type === "holiday") {
    const r = await prisma.holidayInquiry.findUnique({ where: { id: numId } });
    if (!r) notFound();
    ({ name, email, phone, status, createdAt } = r);
    fields = [
      ["Preferred destination", r.preferredDestination],
      ["Travel dates", r.travelStartDate || r.travelEndDate
        ? `${r.travelStartDate ? fmtDate(r.travelStartDate) : "?"} to ${r.travelEndDate ? fmtDate(r.travelEndDate) : "?"}` : null],
      ["Number of travelers", r.numTravelers],
      ["Budget", r.budgetRange],
      ["Accommodation", r.accommodationPreference],
      ["Special requirements", r.specialRequirements],
    ];
  } else {
    notFound();
  }

  const t = type as "contact" | "tour" | "holiday";
  const backHref = `/admin/inquiries?type=${t}`;

  return (
    <>
      <nav className="mb-2 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/admin/inquiries" className="hover:text-teal-700">Inquiries</Link>
        <ChevronRight size={14} />
        <Link href={backHref} className="hover:text-teal-700">{TYPE_LABEL[t]}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">{name}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
          <p className="text-sm text-slate-500">Received {fmtDateTime(createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusSelect value={status} action={updateInquiryStatus.bind(null, t, numId)} />
          <DeleteButton action={deleteInquiry.bind(null, t, numId, backHref)}
            message={`Delete the inquiry from ${name}? This cannot be undone.`} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          {fields.map(([label, value]) => (
            <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-3">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="whitespace-pre-wrap text-sm text-slate-900 sm:col-span-2">
                {value === null || value === undefined || value === "" ? <span className="text-slate-300">-</span> : value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Contact</h2>
          <p className="text-sm text-slate-700">{email}</p>
          {phone && <p className="text-sm text-slate-700">{phone}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <a href={`mailto:${email}`}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800">
              <Mail size={15} /> Reply by email
            </a>
            {phone && (
              <a href={`tel:${phone}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Phone size={15} /> Call
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
