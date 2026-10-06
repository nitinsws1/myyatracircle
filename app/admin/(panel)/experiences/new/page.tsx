import { prisma } from "@/lib/prisma";
import ExperienceForm from "@/components/admin/ExperienceForm";
import { createExperience } from "../actions";

export default async function NewExperiencePage() {
  const destinations = await prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New experience</h1>
      <ExperienceForm action={createExperience} cancelHref="/admin/experiences" destinations={destinations} />
    </>
  );
}
