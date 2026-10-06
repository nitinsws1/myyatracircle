import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/admin/CategoryForm";
import { updateCategory } from "../actions";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const category = await prisma.blogCategory.findUnique({ where: { id: numId } });
  if (!category) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit category: {category.name}</h1>
      <CategoryForm action={updateCategory.bind(null, category.id)} initial={category} />
    </>
  );
}
