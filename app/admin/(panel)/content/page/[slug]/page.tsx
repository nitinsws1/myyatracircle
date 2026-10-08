import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PUBLIC_PAGES } from "@/lib/content-config";
import { getPageMeta } from "@/lib/page-meta";
import PageMetaForm from "@/components/admin/PageMetaForm";

export default async function PageHeaderEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PUBLIC_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  const meta = await getPageMeta(slug);

  return (
    <>
      <nav className="mb-2 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/admin/content" className="hover:text-teal-700">Pages & Content</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">{page.label}</span>
      </nav>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">{page.label} page</h1>
      <PageMetaForm slug={page.slug} path={page.path} defaultTitle={page.defaultTitle} initial={meta} />
    </>
  );
}
