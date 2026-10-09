import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import PhotoTile from "@/components/ui/PhotoTile";
import { experienceDetails } from "@/lib/data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Experiences | My Yatra Circle",
  description: "Signature travel styles and the experiences that go beyond any itinerary.",
};

export default function ExperiencesPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Travel Your Way"
        title="A style of travel for every traveller"
        desc="Signature travel styles and the experiences that go beyond any itinerary."
      />

      <section className={styles.section}>
        <Container>
          <div className={styles.grid}>
            {experienceDetails.map((e) => (
              <div className={styles.tile} key={e.slug}>
                <PhotoTile
                  href={`/experiences/${e.slug}`}
                  image={e.image}
                  alt={e.alt}
                  name={e.title}
                  imagePosition={e.imagePosition}
                />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
