import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HeroBannerForm from "@/components/admin/HeroBannerForm";
import { updateHero } from "../../../actions";

export default async function EditHeroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const banner = await prisma.heroBanner.findUnique({ where: { id: numId } });
  if (!banner) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit hero banner</h1>
      <HeroBannerForm action={updateHero.bind(null, banner.id)} initial={banner} />
    </>
  );
}
