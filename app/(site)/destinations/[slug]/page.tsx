import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailHero from "@/components/ui/DetailHero";
import { destinations } from "@/lib/data";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const destination = destinations.find((d) => d.slug === slug);
  if (!destination) return {};
  return {
    title: `${destination.name} | My Yatra Circle`,
    description: destination.highlight,
  };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = destinations.find((d) => d.slug === slug);
  if (!destination) notFound();

  return (
    <DetailHero
      image={destination.image}
      alt={destination.alt}
      eyebrow={destination.tag}
      title={destination.name}
      notice={`This destination page is a placeholder for the next build phase. ${destination.highlight}`}
      ctaLabel="Plan a Journey Here"
      ctaHref="/#journey-finder"
      backLabel="Back to all destinations"
      backHref="/destinations"
    />
  );
}
