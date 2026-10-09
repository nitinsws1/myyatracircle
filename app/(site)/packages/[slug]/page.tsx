import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailHero from "@/components/ui/DetailHero";
import { packages } from "@/lib/data";

export function generateStaticParams() {
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = packages.find((item) => item.slug === slug);
  if (!pkg) return {};
  return {
    title: `${pkg.title} | My Yatra Circle`,
    description: pkg.desc,
  };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = packages.find((item) => item.slug === slug);
  if (!pkg) notFound();

  return (
    <DetailHero
      image={pkg.image}
      alt={pkg.alt}
      eyebrow={`${pkg.place} · ${pkg.nights}`}
      title={pkg.title}
      notice={`This journey page is a placeholder for the next build phase. ${pkg.desc} A full day-by-day itinerary, pricing and availability will be added once confirmed by the MYC team — nothing here is invented in the meantime.`}
      ctaLabel="Enquire About This Journey"
      ctaHref="/#journey-finder"
      backLabel="Back to all journeys"
      backHref="/packages"
    />
  );
}
