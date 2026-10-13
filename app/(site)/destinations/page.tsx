import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import PhotoCardGrid, { type PhotoCardItem } from "@/components/ui/PhotoCardGrid";
import { getDestinations, getPageSettings } from "@/lib/site-data";
import styles from "./page.module.css";

// Defaults are used whenever the matching SiteSetting row is missing, NULL or empty.
const DEFAULT_TITLE = "Every region MYC travels to";
const DEFAULT_SUBTITLE =
  "From the palaces of Rajasthan to the temples of Kyoto — every destination is chosen for what it teaches, not just what it photographs.";
const DEFAULT_META_TITLE = "Destinations | My Yatra Circle";

// SiteSetting keys used: page.destinations.title / subtitle / banner / bannerType /
// metaTitle / metaDescription / metaKeywords
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPageSettings("destinations");

  return {
    title: settings.metaTitle ?? DEFAULT_META_TITLE,
    description: settings.metaDescription ?? settings.subtitle ?? DEFAULT_SUBTITLE,
    keywords: settings.metaKeywords ?? undefined,
  };
}

export default async function DestinationsPage() {
  const [destinations, settings] = await Promise.all([getDestinations(), getPageSettings("destinations")]);

  // Region "International" = International, any other region = India.
  // Add `region` to getDestinations() to enable the filter chips (they stay hidden without it).
  const items: PhotoCardItem[] = destinations.map((d) => {
    const region = (d as { region?: string | null }).region;
    return {
      slug: d.slug,
      name: d.name,
      image: d.image ?? null,
      alt: d.alt ?? null,
      description: d.tag ?? null,
      group: region ? (region.trim().toLowerCase() === "international" ? "International" : "India") : null,
    };
  });

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Explore Destinations"
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
              hrefBase="/destinations"
              noun={{ one: "destination", many: "destinations" }}
            />
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>Destinations are being prepared</p>
              <p className={styles.emptyText}>Please check back soon.</p>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}