import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DestinationForm from "@/components/admin/DestinationForm";
import { updateDestination } from "../actions";

export default async function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // in recent Next.js, params is a Promise
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const destination = await prisma.destination.findUnique({
    where: { id: numId },
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
  });
  if (!destination) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit: {destination.name}</h1>
      <DestinationForm action={updateDestination.bind(null, destination.id)} initial={destination} />
    </>
  );
}
