import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { stripHtml } from "@/lib/html";
import { getExperienceBySlug } from "@/lib/site-data";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) return { title: "Experience not found | My Yatra Circle", robots: { index: false } };
  return {
    title: `${exp.name} | My Yatra Circle`,
    description: stripHtml(exp.metaDescription) || exp.summary || undefined,
    alternates: { canonical: `/experiences/${exp.slug}` },
  };
}

type Shot = { id: number; url: string };

// A column of framed photos that sits next to the hero text
function PhotoColumn({ shots, name, offset, side }: { shots: Shot[]; name: string; offset: number; side: "left" | "right" }) {
  if (shots.length === 0) return null;
  return (
    <div className={`${styles.photoCol} ${side === "right" ? styles.photoColRight : ""}`}>
      {shots.map((m, i) => (
        <div className={styles.photo} key={m.id}>
          <Image
            alt={`${name} – photo ${offset + i + 1}`}
            src={m.url}
            fill
            sizes="(max-width: 900px) 45vw, 20vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  );
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) notFound();

  const heroImage =
    exp.heroType === "IMAGE" && exp.heroImage ? exp.heroImage : exp.thumbnailImage ?? null;

  // Gallery photos have no section of their own: they stand around the hero text, half on each side.
  const images: Shot[] = exp.gallery.filter((m) => m.type === "IMAGE");
  const half = Math.floor(images.length / 2);
  const leftShots = images.slice(0, half);
  const rightShots = images.slice(half);

  const layout =
    images.length === 0 ? styles.heroGridPlain : leftShots.length === 0 ? styles.heroGridOneSide : "";

  const customizeHref = `/customize-holiday?destination=${encodeURIComponent(
    exp.destinationNames.length > 0 ? `${exp.name} (${exp.destinationNames.join(", ")})` : exp.name
  )}`;
  const contactHref = `/contact?destination=${encodeURIComponent(exp.name)}`;

  return (
    <main id="main-content">
      {/* ── Hero: title, intro and the full description, with the photos around the text ── */}
      <section className={styles.heroRich}>
        {heroImage ? (
          <Image alt="" src={heroImage} fill sizes="100vw" priority style={{ objectFit: "cover" }} />
        ) : null}
        <div aria-hidden="true" className={styles.heroRichScrim} />

        <Container className={`${styles.heroGrid} ${layout}`}>
          <PhotoColumn shots={leftShots} name={exp.name} offset={0} side="left" />

          <div className={styles.heroCopy}>
            {exp.destinationNames.length > 0 && (
              <p className={styles.eyebrow}>{exp.destinationNames.join(" · ")}</p>
            )}
            <h1 className={styles.title}>{exp.name}</h1>
            {exp.shortDescription && (
              <p className={styles.heroDescription}>{stripHtml(exp.shortDescription)}</p>
            )}

            {exp.overviewHtml && (
              <>
                <span className={styles.heroRule} aria-hidden="true" />
                <p className={styles.heroKicker}>About this experience</p>
                <div className={`${styles.richText} ${styles.heroRichText}`} dangerouslySetInnerHTML={{ __html: exp.overviewHtml }} />
              </>
            )}

            <div className={styles.actions}>
              <Button href={customizeHref}>Build a Journey Around This</Button>
              <Link className={`${styles.back} ${styles.heroBack}`} href="/experiences">← Back to all experiences</Link>
            </div>
          </div>

          <PhotoColumn shots={rightShots} name={exp.name} offset={leftShots.length} side="right" />
        </Container>
      </section>

      {/* ── Highlights: a clean editorial list ── */}
      {exp.highlights.length > 0 && (
        <section className={styles.hlSection}>
          <Container>
            <div className={styles.hlLayout}>
              <div className={styles.hlHead}>
                <p className={styles.hlEyebrow}>What to expect</p>
                <h2 className={styles.hlTitle}>Highlights</h2>
                <p className={styles.hlLead}>The moments that make {exp.name} worth travelling for.</p>
              </div>
              <ol className={styles.hlList}>
                {exp.highlights.map((h, i) => (
                  <li className={styles.hlItem} key={h.id}>
                    <span className={styles.hlNum} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.hlText}>{stripHtml(h.text)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      )}

      {/* ── CTA ── */}
      <section className={styles.ctaBand}>
        <Container className={styles.ctaInner}>
          <div>
            <p className={styles.eyebrow}>Ready to experience this?</p>
            <h2 className={styles.ctaTitle}>Let MYC plan it for you</h2>
            <p className={styles.ctaText}>Share your dates and travel preferences — we&apos;ll design an itinerary around {exp.name}.</p>
          </div>
          <div className={styles.ctaActions}>
            <Button href={contactHref}>Send an Enquiry</Button>
            <Link className={styles.ctaGhost} href={customizeHref}>Customize my holiday</Link>
          </div>
        </Container>
      </section>
    </main>
  );
}