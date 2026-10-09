import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About Us | My Yatra Circle",
  description:
    "My Yatra Circle is an India-origin travel company building curated journeys across India and beyond — planned by hand, never templated.",
};

const FEATURES = [
  { index: "01", label: "Handpicked Itineraries" },
  { index: "02", label: "Concierge Support" },
  { index: "03", label: "Never Templated" },
];

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className={styles.hero}>
        <Image
          alt="Veranda overlooking the Alleppey backwaters and traditional houseboats in Kerala"
          src="/images/about-kerala.jpg"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover" }}
        />
        <div aria-hidden="true" className={styles.scrim} />
        <Container className={styles.heroCaption}>
          <p className={styles.eyebrow}>About MYC</p>
          <h1 className={styles.title}>A circle of curated journeys</h1>
        </Container>
      </section>

      <section className={styles.body}>
        <Container className={styles.bodyInner}>
          <SectionLabel tone="gold-dark">Who we are</SectionLabel>
          <p className={styles.paragraph}>
            My Yatra Circle is an India-origin travel company building curated journeys across India and beyond. Every
            itinerary is planned by hand — never templated — and paired with concierge support from the first enquiry
            to the last mile home.
          </p>
          <p className={styles.paragraph}>
            Curated. Heritage. International. This is travel built around the traveller, not the other way around.
          </p>
          <p className={styles.paragraph}>
            MYC&rsquo;s own journeys began in Rajasthan, but the circle now spans destinations across India and beyond
            — from Kyoto&rsquo;s quiet gardens to the Amalfi Coast&rsquo;s cliffside towns. Every region is chosen for
            what it teaches, not just what it photographs.
          </p>
          <div className={styles.featureRow}>
            {FEATURES.map((f) => (
              <div key={f.index}>
                <p className={styles.featureIndex}>{f.index}</p>
                <p className={styles.featureLabel}>{f.label}</p>
              </div>
            ))}
          </div>
          <div className={styles.cta}>
            <Button href="/#journey-finder">Plan Your Journey</Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
