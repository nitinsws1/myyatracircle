"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import PackageCard from "./PackageCard";
import type { Package } from "@/lib/data";
import styles from "./FeaturedPackages.module.css";

export default function FeaturedPackagesClient({
  packages,
  heading,
  subheading,
}: {
  packages: Package[];
  heading?: string | null;
  subheading?: string | null;
}) {
  const [hero, ...supporting] = packages;

  return (
    <section aria-labelledby="featured-journeys-heading" className={styles.section} id="featured-journeys">
      <Container width="editorial">
        <motion.div
          className={styles.headerRow}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <SectionLabel>Packages</SectionLabel>
            <SectionHeading id="featured-journeys-heading">
              {heading?.trim() || "Journeys to inspire what comes next."}
            </SectionHeading>
            {subheading?.trim() && <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600">{subheading.trim()}</p>}
          </div>
          <Button href="/packages" variant="tertiary">
            View All Journeys
          </Button>
        </motion.div>
      </Container>

      <Container width="wide" className={styles.grid}>
        <div className={styles.layout}>
          <div className={styles.heroCol}>
            <PackageCard package={hero} variant="hero" showRing sizes="(max-width: 767px) 92vw, (max-width: 1279px) 90vw, 46vw" />
          </div>
          <div className={styles.supportingCol}>
            {supporting.map((pkg) => (
              <PackageCard key={pkg.slug} package={pkg} variant="compact" sizes="(max-width: 767px) 30vw, 200px" />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
