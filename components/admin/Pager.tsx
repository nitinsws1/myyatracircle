import Link from "next/link";

export default function Pager({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <span>Page {page} of {pages}</span>
      <div className="flex gap-2">
        {page > 1 && <Link href={hrefFor(page - 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">Previous</Link>}
        {page < pages && <Link href={hrefFor(page + 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">Next</Link>}
      </div>
    </div>
  );
}
