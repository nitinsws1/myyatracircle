import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageForm, { type SectionValues } from "@/components/admin/PageForm";
import { updatePage } from "../actions";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const page = await prisma.page.findUnique({ where: { id: numId }, include: { sections: true } });
  if (!page) notFound();

  const sections: SectionValues = Object.fromEntries(
    page.sections.map((s) => [s.sectionKey, { title: s.title, content: s.content, imageUrl: s.imageUrl }])
  );

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit page: {page.title}</h1>
      <PageForm action={updatePage.bind(null, page.id)} initial={page} sections={sections} />
    </>
  );
}
