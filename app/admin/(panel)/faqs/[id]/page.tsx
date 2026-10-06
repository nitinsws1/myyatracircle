import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FaqForm from "@/components/admin/FaqForm";
import { updateFaq } from "../actions";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const faq = await prisma.faq.findUnique({ where: { id: numId } });
  if (!faq) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit FAQ</h1>
      <FaqForm action={updateFaq.bind(null, faq.id)} initial={faq} />
    </>
  );
}
