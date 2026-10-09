import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import PhotoTile from "@/components/ui/PhotoTile";
import { destinations } from "@/lib/data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Destinations | My Yatra Circle",
  description:
    "From the palaces of Rajasthan to the temples of Kyoto — every destination is chosen for what it teaches, not just what it photographs.",
};

export default function DestinationsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Explore Destinations"
        title="Every region MYC travels to"
        desc="From the palaces of Rajasthan to the temples of Kyoto — every destination is chosen for what it teaches, not just what it photographs."
      />

      <section className={styles.section}>
        <Container>
          <div className={styles.grid}>
            {destinations.map((d) => (
              <div className={styles.tile} key={d.slug}>
                <PhotoTile
                  href={`/destinations/${d.slug}`}
                  image={d.image}
                  alt={d.alt}
                  name={d.name}
                  tag={d.tag}
                  imagePosition={d.imagePosition}
                />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
