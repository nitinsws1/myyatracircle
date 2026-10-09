import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailHero from "@/components/ui/DetailHero";
import { experienceDetails } from "@/lib/data";

export function generateStaticParams() {
  return experienceDetails.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const experience = experienceDetails.find((e) => e.slug === slug);
  if (!experience) return {};
  return {
    title: `${experience.title} | My Yatra Circle`,
    description: experience.desc,
  };
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experience = experienceDetails.find((e) => e.slug === slug);
  if (!experience) notFound();

  return (
    <DetailHero
      image={experience.image}
      alt={experience.alt}
      eyebrow={experience.eyebrow}
      title={experience.title}
      notice={`This experience page is a placeholder for the next build phase. ${experience.desc}`}
      ctaLabel="Build a Journey Around This"
      ctaHref="/#journey-finder"
      backLabel="Back to all experiences"
      backHref="/experiences"
    />
  );
}
