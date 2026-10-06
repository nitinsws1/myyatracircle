import { prisma } from "@/lib/prisma";
import PackageForm from "@/components/admin/PackageForm";
import { createPackage } from "../actions";

export default async function NewPackagePage() {
  const destinations = await prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New package</h1>
      <PackageForm action={createPackage} cancelHref="/admin/packages" destinations={destinations} />
    </>
  );
}
