import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact | My Yatra Circle",
  description: "No checkout page, no call centre — just the people who will actually plan your trip.",
};

export default function ContactPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Contact"
        title="Let's start with a conversation"
        desc="No checkout page, no call centre — just the people who will actually plan your trip."
      />

      <section className={styles.section}>
        <Container className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.label}>Email</p>
            <a className={styles.value} href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
          </div>
          <div className={styles.card}>
            <p className={styles.label}>Phone</p>
            <a className={styles.value} href={`tel:${siteConfig.phoneHref}`}>
              {siteConfig.phone}
            </a>
          </div>
          <div className={styles.card}>
            <p className={styles.label}>Office</p>
            <p className={styles.value}>{siteConfig.address}</p>
          </div>
        </Container>
        <Container className={styles.ctaRow}>
          <Button href="/#journey-finder">Plan Your Journey</Button>
        </Container>
      </section>
    </main>
  );
}
