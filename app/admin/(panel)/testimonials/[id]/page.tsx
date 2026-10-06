import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TestimonialForm from "@/components/admin/TestimonialForm";
import { updateTestimonial } from "../actions";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const item = await prisma.testimonial.findUnique({ where: { id: numId } });
  if (!item) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit testimonial</h1>
      <TestimonialForm action={updateTestimonial.bind(null, item.id)} initial={item} />
    </>
  );
}
