import Link from "next/link";
import { Search } from "lucide-react";

type Select = { name: string; value?: string; allLabel: string; options: { value: string; label: string }[] };

// Search box + dropdown filters as a plain GET form. Works on any list page.
export default function ListFilters({ action, hidden = {}, q, placeholder, selects = [], total }: {
  action: string;
  hidden?: Record<string, string>;
  q?: string;
  placeholder: string;
  selects?: Select[];
  total: number;
}) {
  const filtering = !!q || selects.some((s) => s.value);
  const params = new URLSearchParams(hidden).toString();
  const clearHref = params ? `${action}?${params}` : action;

  return (
    <form method="get" action={action} className="mt-4 flex flex-wrap items-center gap-2">
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input name="q" defaultValue={q} placeholder={placeholder}
          className="w-72 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
      </div>
      {selects.map((s) => (
        <select key={s.name} name={s.name} defaultValue={s.value ?? ""}
          className="max-w-[12rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-600">
          <option value="">{s.allLabel}</option>
          {s.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}
      <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900">Search</button>
      {filtering && <Link href={clearHref} className="text-sm text-slate-500 hover:underline">Clear</Link>}
      <span className="ml-auto text-sm text-slate-500">{total} result{total === 1 ? "" : "s"}</span>
    </form>
  );
}
