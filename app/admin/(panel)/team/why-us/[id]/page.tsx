import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WhyUsForm from "@/components/admin/WhyUsForm";
import { updateWhy } from "../../actions";

export default async function EditWhyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const item = await prisma.whyUsItem.findUnique({ where: { id: numId } });
  if (!item) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit: {item.title}</h1>
      <WhyUsForm action={updateWhy.bind(null, item.id)} initial={item} />
    </>
  );
}
