import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import PhotoCardGrid, { type PhotoCardItem } from "@/components/ui/PhotoCardGrid";
import { getExperiences, getPageSettings } from "@/lib/site-data";
import styles from "./page.module.css";

// Defaults are used whenever the matching SiteSetting row is missing, NULL or empty.
const DEFAULT_TITLE = "A style of travel for every traveller";
const DEFAULT_SUBTITLE = "Signature travel styles and the experiences that go beyond any itinerary.";
const DEFAULT_META_TITLE = "Experiences | My Yatra Circle";

// "A · B · C · D" -> "A · B · C · +1 more" so the hover caption stays short
const shortTag = (tag: string, max = 3) => {
  const parts = tag.split(" · ");
  return parts.length > max ? `${parts.slice(0, max).join(" · ")} · +${parts.length - max} more` : tag;
};

// SiteSetting keys used here: page.experiences.title / subtitle / banner / bannerType /
// metaTitle / metaDescription / metaKeywords
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPageSettings("experiences");

  return {
    title: settings.metaTitle ?? DEFAULT_META_TITLE,
    description: settings.metaDescription ?? settings.subtitle ?? DEFAULT_SUBTITLE,
    keywords: settings.metaKeywords ?? undefined,
  };
}

export default async function ExperiencesPage() {
  const [experiences, settings] = await Promise.all([getExperiences(), getPageSettings("experiences")]);

  const items: PhotoCardItem[] = experiences.map((e) => ({
    slug: e.slug,
    name: e.name,
    image: e.image ?? "/images/about-kerala.jpg",
    alt: e.name,
    description: e.eyebrow ? shortTag(e.eyebrow) : null,
  }));

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Travel Your Way"
        title={settings.title ?? DEFAULT_TITLE}
        desc={settings.subtitle ?? DEFAULT_SUBTITLE}
        banner={settings.banner}
        bannerType={settings.bannerType}
      />

      <section className={styles.section}>
        <Container>
          {items.length > 0 ? (
            <PhotoCardGrid
              items={items}
              hrefBase="/experiences"
              noun={{ one: "experience", many: "experiences" }}
            />
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No experiences published yet</p>
              <p className={styles.emptyText}>New travel styles are on their way. Please check back soon.</p>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}