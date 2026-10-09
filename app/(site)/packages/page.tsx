import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import PackageCard from "@/components/home/PackageCard";
import { packages } from "@/lib/data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Journeys | My Yatra Circle",
  description: "Every private tour MYC plans — bespoke itineraries, planned by hand, never templated.",
};

export default function PackagesPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Private Tours"
        title="Every private tour MYC plans"
        desc="Bespoke itineraries — planned by hand, never templated."
      />

      {/* <section className={styles.section}>
        <Container className={styles.grid}>
          {packages.map((pkg) => (
            <PackageCard key={pkg.slug} package={pkg} showRing sizes="(max-width: 1023px) 46vw, 23vw" />
          ))}
        </Container>
      </section> */}
    </main>
  );
}
