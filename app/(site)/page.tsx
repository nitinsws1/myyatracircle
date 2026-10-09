import type { ReactNode } from "react";
import { getHomeSections } from "@/lib/site-data";
import { stripHtml } from "@/lib/html";
import Hero from "@/components/home/Hero";
import DestinationGrid from "@/components/home/DestinationGrid";
import FeaturedPackages from "@/components/home/FeaturedPackages";
import BeyondItinerary from "@/components/home/BeyondItinerary";
import WhyMYC from "@/components/home/WhyMYC";
import FeaturedBlogs from "@/components/home/FeaturedBlogs";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export const revalidate = 60; // safety net if an admin action forgets revalidatePath("/")

type Section = { key: string; title: string | null; subtitle: string | null };

// The keys are the real ones from HOME_SECTIONS (lib/content-config.ts).
// Section headings and subtitles come from the visible homepageSection rows.
const SECTIONS: Record<string, (s: Section) => ReactNode> = {
  hero: () => <Hero />,
  featuredDestinations: (s) => (
    <DestinationGrid heading={s.title} subheading={s.subtitle} />
  ),
  featuredPackages: (s) => <FeaturedPackages heading={s.title} subheading={s.subtitle} />,
  experiences: (s) => <BeyondItinerary heading={s.title} subheading={s.subtitle} />,
  whyUs: (s) => <WhyMYC heading={s.title} subheading={s.subtitle} />,
  testimonials: (s) => <TestimonialsSection heading={s.title} subheading={s.subtitle} />,
  blogs: (s) => <FeaturedBlogs heading={s.title} subheading={s.subtitle} />,
};

export default async function HomePage() {
  const sections = await getHomeSections(); // visible ones, in admin order

  return (
    <main id="main-content">
      {sections.map((s) => (
        <div key={s.key} style={{ display: "contents" }}>
          {SECTIONS[s.key]?.({
            ...s,
            title: s.title ? stripHtml(s.title) : null,
            subtitle: s.subtitle ? stripHtml(s.subtitle) : null,
          }) ?? null}
        </div>
      ))}
    </main>
  );
}