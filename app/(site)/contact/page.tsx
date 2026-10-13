import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import ContactForm from "@/components/site/ContactForm";
import { getSiteSettings } from "@/lib/site-data";
import { siteConfig } from "@/lib/data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact | My Yatra Circle",
  description: "No checkout page, no call centre — just the people who will actually plan your trip.",
};

type ContactPageProps = {
  searchParams: Promise<{
    destination?: string;
    package?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const sp = await searchParams;
  const initialDestination = sp.package || sp.destination || "";
  const settings = await getSiteSettings();

  const email = settings.email || siteConfig.email;
  const phone = settings.phone || siteConfig.phone;
  const phoneHref = phone ? phone.replace(/[^\d+]/g, "") : siteConfig.phoneHref;
  const address = settings.address || siteConfig.address;

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Contact"
        title="Let's start with a conversation"
        desc="No checkout page, no call centre — just the people who will actually plan your trip."
      />

      <section className={styles.section}>
        <Container className={styles.contentContainer}>
          <div className={styles.layoutGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.card}>
                <p className={styles.label}>Email</p>
                <a className={styles.value} href={`mailto:${email}`}>
                  {email}
                </a>
              </div>

              <div className={styles.card}>
                <p className={styles.label}>Phone / WhatsApp</p>
                <a className={styles.value} href={`tel:${phoneHref}`}>
                  {phone}
                </a>
              </div>

              {address && (
                <div className={styles.card}>
                  <p className={styles.label}>Office</p>
                  <p className={styles.value}>{address}</p>
                </div>
              )}

              <div className={styles.noteCard}>
                <p className={styles.noteTitle}>Personal Concierge</p>
                <p className={styles.noteText}>
                  Every inquiry is handled directly by experienced travel designers with in-depth
                  destination knowledge, not automated bots.
                </p>
              </div>
            </aside>

            <div className={styles.formCol}>
              <ContactForm initialDestination={initialDestination} />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
