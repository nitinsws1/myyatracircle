import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageForm from "@/components/admin/PageForm";
import { updatePage } from "../actions";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);

  const page = Number.isInteger(numId)
    ? await prisma.page.findUnique({
        where: { id: numId },
        include: { sections: { orderBy: { sortOrder: "asc" } } },
      })
    : await prisma.page.findUnique({
        where: { slug: id },
        include: { sections: { orderBy: { sortOrder: "asc" } } },
      });

  if (!page) notFound();

  const [teamCount, whyUsCount] = await Promise.all([
    prisma.teamMember.count({ where: { isActive: true } }),
    prisma.whyUsItem.count({ where: { isActive: true } }),
  ]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit page: {page.title}</h1>
      <PageForm
        action={updatePage.bind(null, page.id)}
        initial={page}
        sections={page.sections}
        teamCount={teamCount}
        whyUsCount={whyUsCount}
      />
    </>
  );
}
