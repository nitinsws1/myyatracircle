import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlaceForm from "@/components/admin/PlaceForm";
import { updatePlace } from "../actions";

export default async function EditPlacePage({ params }: { params: Promise<{ id: string; placeId: string }> }) {
  const { id, placeId } = await params;
  const destinationId = Number(id);
  const pid = Number(placeId);
  if (!Number.isInteger(destinationId) || !Number.isInteger(pid)) notFound();

  const place = await prisma.place.findFirst({
    where: { id: pid, destinationId },
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
  });
  if (!place) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit place: {place.name}</h1>
      <PlaceForm
        action={updatePlace.bind(null, destinationId, place.id)}
        cancelHref={`/admin/destinations/${destinationId}/places`}
        initial={place}
      />
    </>
  );
}
