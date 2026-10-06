import Link from "next/link";
import { FileText, Play, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KINDS, KIND_LABEL, KIND_PLURAL, fmtBytes, isKind, type MediaKind } from "@/lib/media-config";
import { fmtDateTime } from "@/lib/inquiry-config";
import { findUsage, mediaWhere } from "@/lib/media-server";
import MediaDetail from "@/components/admin/MediaDetail";
import MediaUploader, { SyncButton } from "@/components/admin/MediaUploader";

const PER_PAGE = 24;
type SP = { q?: string; kind?: string; page?: string; selected?: string };

function Preview({ kind, url, name, className = "" }: { kind: MediaKind; url: string; name: string; className?: string }) {
  if (kind === "VIDEO") return <video src={url} muted preload="metadata" className={`h-full w-full object-cover ${className}`} />;
  if (kind === "DOCUMENT") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
        <FileText size={36} />
        <span className="text-xs uppercase">{name.split(".").pop()}</span>
      </div>
    );
  }
  return <img src={url} alt="" className={`h-full w-full ${kind === "LOGO" ? "object-contain p-3" : "object-cover"} ${className}`} />;
}

export default async function MediaPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const kind = sp.kind && isKind(sp.kind) ? sp.kind : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const selectedId = Number(sp.selected) || undefined;

  const where = mediaWhere(q, kind ? [kind] : []);
  const [items, total, selected] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    prisma.media.count({ where }),
    selectedId ? prisma.media.findUnique({ where: { id: selectedId } }) : null,
  ]);
  const usage = selected ? await findUsage(selected.url) : [];
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const href = (over: Partial<Record<keyof SP, string | undefined>>) => {
    const p = new URLSearchParams();
    Object.entries({ q, kind, page: String(page), selected: sp.selected, ...over }).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/admin/media?${p}`;
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-slate-900">Media Library</h1>
          <p className="text-sm text-slate-500">Upload once, reuse every image, video, document and logo across the site.</p>
        </div>
        <MediaUploader />
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {kind && <input type="hidden" name="kind" value={kind} />}
        <div className="relative min-w-64 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Search by name, tag or alt text..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={href({ kind: undefined, page: undefined, selected: undefined })}
            className={`rounded-lg px-4 py-2 text-sm ${!kind ? "bg-teal-700 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>All</Link>
          {KINDS.map((k) => (
            <Link key={k} href={href({ kind: k, page: undefined, selected: undefined })}
              className={`rounded-lg px-4 py-2 text-sm ${kind === k ? "bg-teal-700 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
              {KIND_PLURAL[k]}
            </Link>
          ))}
        </div>
      </form>

      <div className="mt-3 flex items-center justify-between">
        <SyncButton />
        <span className="text-sm text-slate-500">{total} file{total === 1 ? "" : "s"}</span>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-400">
              {q || kind ? "Nothing matches your search." : 'No files yet. Click "Upload", or "Import files already used on the site".'}
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {items.map((m) => (
                <li key={m.id}>
                  <Link href={href({ selected: String(m.id) })}
                    className={`block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
                      m.id === selected?.id ? "border-teal-600 ring-2 ring-teal-200" : "border-slate-200"}`}>
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <Preview kind={m.kind} url={m.url} name={m.name} />
                      {m.kind === "VIDEO" && (
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                          <Play size={10} /> Video
                        </span>
                      )}
                      {m.kind === "LOGO" && (
                        <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">Logo</span>
                      )}
                    </div>
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium text-slate-800" title={m.name}>{m.name}</p>
                      <p className="text-xs text-slate-400">{fmtBytes(m.bytes) || KIND_LABEL[m.kind]}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {pages > 1 && (
            <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
              <span>Page {page} of {pages}</span>
              <div className="flex gap-2">
                {page > 1 && <Link href={href({ page: String(page - 1) })} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">Previous</Link>}
                {page < pages && <Link href={href({ page: String(page + 1) })} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">Next</Link>}
              </div>
            </div>
          )}
        </div>

        {/* details panel */}
        <aside className="h-fit lg:sticky lg:top-6">
          {selected ? (
            <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                {selected.kind === "VIDEO" ? (
                  <video src={selected.url} controls preload="metadata" className="h-full w-full object-contain" />
                ) : (
                  <Preview kind={selected.kind} url={selected.url} name={selected.name} />
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt className="text-slate-400">Type</dt><dd className="text-slate-700">{KIND_LABEL[selected.kind]}</dd>
                {selected.bytes ? (<><dt className="text-slate-400">Size</dt><dd className="text-slate-700">{fmtBytes(selected.bytes)}</dd></>) : null}
                {selected.width && selected.height ? (<><dt className="text-slate-400">Dimensions</dt><dd className="text-slate-700">{selected.width} × {selected.height}</dd></>) : null}
                <dt className="text-slate-400">Uploaded</dt><dd className="text-slate-700">{fmtDateTime(selected.createdAt)}</dd>
              </dl>

              <MediaDetail key={selected.id} id={selected.id} url={selected.url} name={selected.name}
                altText={selected.altText} tags={selected.tags} usageCount={usage.length} />

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700">Used in ({usage.length})</p>
                {usage.length === 0 ? (
                  <p className="mt-1 text-xs text-slate-400">Not used anywhere yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {usage.map((u, i) => (
                      <li key={i} className="text-xs">
                        {u.href ? <Link href={u.href} className="text-teal-700 hover:underline">{u.label}</Link> : <span className="text-slate-600">{u.label}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center text-sm text-slate-400">
              Select an asset to view and edit its details, tags, and usage.
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
