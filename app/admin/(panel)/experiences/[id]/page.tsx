import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExperienceForm from "@/components/admin/ExperienceForm";
import { updateExperience } from "../actions";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const [experience, destinations] = await Promise.all([
    prisma.experience.findUnique({
      where: { id: numId },
      include: {
        gallery: { orderBy: { sortOrder: "asc" } },
        highlights: { orderBy: { sortOrder: "asc" } },
        destinations: true,
      },
    }),
    prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!experience) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit experience: {experience.name}</h1>
      <ExperienceForm action={updateExperience.bind(null, experience.id)} cancelHref="/admin/experiences"
        destinations={destinations} initial={experience} />
    </>
  );
}
