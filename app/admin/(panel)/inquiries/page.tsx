import Link from "next/link";
import { Download, Eye, Search } from "lucide-react";
import {
  PAGE_SIZE, STATUSES, STATUS_LABEL, TYPES, TYPE_LABEL, fmtDateTime, isType, type InquiryType,
} from "@/lib/inquiry-config";
import { listInquiries, listSubscribers, tabCounts } from "@/lib/inquiries";
import DeleteButton from "@/components/admin/DeleteButton";
import StatusSelect from "@/components/admin/StatusSelect";
import ToggleForm from "@/components/admin/ToggleForm";
import { deleteInquiry, deleteSubscriber, toggleSubscriber, updateInquiryStatus } from "./actions";

type SP = { type?: string; q?: string; status?: string; page?: string };

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const type: InquiryType = sp.type && isType(sp.type) ? sp.type : "contact";
  const q = sp.q?.trim() || undefined;
  const status = sp.status || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const counts = await tabCounts();
  const filters = { q, status };

  // build a link that keeps the current filters but changes some of them
  const href = (over: Partial<Record<keyof SP, string | undefined>>) => {
    const p = new URLSearchParams();
    Object.entries({ type, q, status, page: String(page), ...over }).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/admin/inquiries?${p}`;
  };
  const exportHref = `/admin/inquiries/export?${new URLSearchParams(
    Object.entries({ type, q, status }).filter(([, v]) => v) as [string, string][]
  )}`;

  const isNews = type === "newsletter";
  const data = isNews ? null : await listInquiries(type as Exclude<InquiryType, "newsletter">, filters, page);
  const subs = isNews ? await listSubscribers(filters, page) : null;
  const total = isNews ? subs!.total : data!.total;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-slate-900">Inquiries</h1>
          <p className="text-sm text-slate-500">Everything visitors send from the website.</p>
        </div>
        <a href={exportHref}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          <Download size={16} /> Export CSV
        </a>
      </div>

      {/* tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TYPES.map((t) => (
          <Link key={t} href={href({ type: t, q: undefined, status: undefined, page: undefined })}
            className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${
              t === type ? "border-teal-700 text-teal-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {TYPE_LABEL[t]}
            {counts[t] > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs ${t === "newsletter" ? "bg-slate-100 text-slate-600" : "bg-sky-100 text-sky-700"}`}>
                {counts[t]}{t === "newsletter" ? "" : " new"}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* filters (plain GET form, no JavaScript needed) */}
      <form method="get" className="mt-4 flex flex-wrap items-center gap-2">
        <input type="hidden" name="type" value={type} />
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder={isNews ? "Search email" : "Search name, email or phone"}
            className="w-72 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </div>
        <select name="status" defaultValue={status ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-600">
          <option value="">All</option>
          {isNews ? (
            <>
              <option value="active">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
            </>
          ) : (
            STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)
          )}
        </select>
        <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900">Filter</button>
        {(q || status) && (
          <Link href={href({ q: undefined, status: undefined, page: undefined })} className="text-sm text-slate-500 hover:underline">
            Clear
          </Link>
        )}
        <span className="ml-auto text-sm text-slate-500">{total} result{total === 1 ? "" : "s"}</span>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {isNews ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscribed on</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subs!.rows.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.email}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDateTime(s.subscribedAt)}</td>
                  <td className="px-4 py-3">
                    <ToggleForm action={toggleSubscriber.bind(null, s.id)} on={s.isSubscribed}
                      onLabel="Subscribed" offLabel="Unsubscribed" title="Click to change" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <DeleteButton action={deleteSubscriber.bind(null, s.id)} message={`Delete ${s.email} from the list?`} />
                    </div>
                  </td>
                </tr>
              ))}
              {subs!.rows.length === 0 && <EmptyRow cols={4} />}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">{type === "tour" ? "Package" : "Interested in"}</th>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data!.rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.phone || "-"}</td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-slate-600">{r.extra}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusSelect value={r.status} action={updateInquiryStatus.bind(null, type, r.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/inquiries/${type}/${r.id}`}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="View details">
                        <Eye size={16} />
                      </Link>
                      <DeleteButton action={deleteInquiry.bind(null, type, r.id, undefined)}
                        message={`Delete the inquiry from ${r.name}? This cannot be undone.`} />
                    </div>
                  </td>
                </tr>
              ))}
              {data!.rows.length === 0 && <EmptyRow cols={6} />}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={href({ page: String(page - 1) })} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">Previous</Link>}
            {page < pages && <Link href={href({ page: String(page + 1) })} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">Next</Link>}
          </div>
        </div>
      )}
    </>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr><td colSpan={cols} className="px-4 py-12 text-center text-slate-400">Nothing here yet.</td></tr>
  );
}
