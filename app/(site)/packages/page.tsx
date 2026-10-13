import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import PackageCard from "@/components/home/PackageCard";
import { getPackages, getPageSettings } from "@/lib/site-data";
import styles from "./page.module.css";

// Defaults are used whenever the matching SiteSetting row is missing, NULL or empty.
const DEFAULT_TITLE = "Every private tour MYC plans";
const DEFAULT_SUBTITLE = "Bespoke itineraries — planned by hand, never templated.";
const DEFAULT_META_TITLE = "Journeys | My Yatra Circle";
const DEFAULT_META_DESCRIPTION =
  "Every private tour MYC plans — bespoke itineraries, planned by hand, never templated.";

// SiteSetting keys used: page.packages.title / subtitle / banner / bannerType /
// metaTitle / metaDescription / metaKeywords
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPageSettings("packages");

  return {
    title: settings.metaTitle ?? DEFAULT_META_TITLE,
    description: settings.metaDescription ?? DEFAULT_META_DESCRIPTION,
    keywords: settings.metaKeywords ?? undefined,
  };
}

export default async function PackagesPage() {
  const [packages, settings] = await Promise.all([getPackages(), getPageSettings("packages")]);

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Explore the World"
        title={settings.title ?? DEFAULT_TITLE}
        desc={settings.subtitle ?? DEFAULT_SUBTITLE}
        banner={settings.banner}
        bannerType={settings.bannerType}
      />

      <section className={styles.section}>
        {packages.length > 0 && (
          <Container width="editorial" className={styles.intro}>
            <div className={styles.introCopy}>
              <p className={styles.introEyebrow}>The MYC collection</p>
              <h2 className={styles.introTitle}>Journeys worth remembering</h2>
              <p className={styles.introText}>
                Thoughtfully planned escapes, crafted around the places you have always wanted to experience.
              </p>
            </div>
            <div className={styles.count} aria-label={`${packages.length} available journeys`}>
              <span className={styles.countNumber}>{String(packages.length).padStart(2, "0")}</span>
              <span className={styles.countLabel}>{packages.length === 1 ? "journey" : "journeys"}<br />to explore</span>
            </div>
          </Container>
        )}

        <Container width="editorial" className={styles.grid}>
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.slug}
              variant="catalog"
              sizes="(max-width: 600px) 100vw, (max-width: 1023px) 50vw, 33vw"
              package={{
                slug: pkg.slug,
                title: pkg.title,
                typeTag: "Tour Package",
                place: pkg.destinations || "Featured journey",
                nights: pkg.nightsCount ? `${pkg.nightsCount} Nights` : pkg.duration,
                nightsCount: pkg.nightsCount,
                region: pkg.region,
                desc: pkg.summary,
                image: pkg.image,
                alt: pkg.title,
              }}
            />
          ))}
        </Container>

        {packages.length === 0 && (
          <Container>
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No tour packages published yet</p>
              <p className={styles.emptyText}>New journeys are on their way. Please check back soon.</p>
            </div>
          </Container>
        )}
      </section>
    </main>
  );
}