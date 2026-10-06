import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PackageForm from "@/components/admin/PackageForm";
import { updatePackage } from "../actions";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const [pkg, destinations] = await Promise.all([
    prisma.tourPackage.findUnique({
      where: { id: numId },
      include: {
        gallery: { orderBy: { sortOrder: "asc" } },
        highlights: { orderBy: { sortOrder: "asc" } },
        inclusions: { orderBy: { sortOrder: "asc" } },
        itinerary: { orderBy: { dayNumber: "asc" } },
        destinations: true,
      },
    }),
    prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!pkg) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit package: {pkg.name}</h1>
      <PackageForm action={updatePackage.bind(null, pkg.id)} cancelHref="/admin/packages"
        destinations={destinations} initial={pkg} />
    </>
  );
}
