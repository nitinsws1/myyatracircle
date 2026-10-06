import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlaceForm from "@/components/admin/PlaceForm";
import { createPlace } from "../actions";

export default async function NewPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destinationId = Number(id);
  if (!Number.isInteger(destinationId)) notFound();

  const destination = await prisma.destination.findUnique({ where: { id: destinationId } });
  if (!destination) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Add place to {destination.name}</h1>
      <PlaceForm
        action={createPlace.bind(null, destination.id)}
        cancelHref={`/admin/destinations/${destination.id}/places`}
      />
    </>
  );
}
