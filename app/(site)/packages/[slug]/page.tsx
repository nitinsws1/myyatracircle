import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import TourInquiryForm from "@/components/site/TourInquiryForm";
import { cleanHtml, stripHtml } from "@/lib/html";
import { getPackageBySlug } from "@/lib/site-data";
import styles from "./page.module.css";

/* ─── Route helpers ─── */
const BACK_HREF = "/packages";
const INQUIRY_ANCHOR = "#enquire";
const HOLIDAY_HREF = "/customize-holiday";

/* ─── Metadata ─── */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: "Journey not found | My Yatra Circle", robots: { index: false } };

  const name = stripHtml(pkg.name);
  const description = stripHtml(pkg.metaDescription) || stripHtml(pkg.shortDescription ?? "") || undefined;
  return {
    title: `${name} | My Yatra Circle`,
    description,
    keywords: pkg.metaKeywords?.split(",").map((k) => k.trim()).filter(Boolean),
    alternates: { canonical: `/packages/${pkg.slug}` },
    openGraph: {
      type: "website",
      title: name,
      description,
      images: pkg.thumbnailImage
        ? [{ url: pkg.thumbnailImage, alt: name }]
        : pkg.heroType === "IMAGE" && pkg.heroImage
        ? [{ url: pkg.heroImage, alt: name }]
        : undefined,
    },
  };
}

/* ─── Page ─── */
export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const name = stripHtml(pkg.name);
  const heroImage =
    pkg.heroType === "IMAGE" && pkg.heroImage ? pkg.heroImage : pkg.thumbnailImage ?? null;
  const overviewHtml = cleanHtml(pkg.overview);
  const destinations = pkg.destinations.map((d) => stripHtml(d.destination.name)).join(", ");
  const duration =
    pkg.durationDays && pkg.durationNights != null
      ? `${pkg.durationDays}D / ${pkg.durationNights}N`
      : pkg.durationDays
      ? `${pkg.durationDays} Days`
      : pkg.durationNights
      ? `${pkg.durationNights} Nights`
      : "";

  const inclusions = pkg.inclusions.filter((i) => i.kind === "INCLUSION");
  const exclusions = pkg.inclusions.filter((i) => i.kind === "EXCLUSION");

  return (
    <main id="main-content">
      {/* ── Hero ── */}
      <section className={styles.hero}>
        {heroImage ? (
          <Image
            alt={name}
            src={heroImage}
            fill
            sizes="100vw"
            priority
            style={{ objectFit: "cover" }}
          />
        ) : null}
        <div aria-hidden="true" className={styles.heroScrim} />
        <Container className={styles.heroContent}>
          {destinations || duration ? (
            <p className={styles.eyebrow}>
              {[destinations, duration].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          <h1 className={styles.title}>{name}</h1>
          {pkg.shortDescription ? (
            <p className={styles.heroDescription}>{stripHtml(pkg.shortDescription)}</p>
          ) : null}
        </Container>
      </section>

      {/* ── Overview ── */}
      {(overviewHtml || pkg.shortDescription) && (
        <section className={styles.section}>
          <Container className={styles.bodyInner}>
            <h2 className={styles.sectionTitle}>Overview</h2>
            {overviewHtml ? (
              <div className={styles.richText} dangerouslySetInnerHTML={{ __html: overviewHtml }} />
            ) : (
              <p className={styles.richText}>{stripHtml(pkg.shortDescription ?? "")}</p>
            )}
            <div className={styles.actions}>
              <Button href={INQUIRY_ANCHOR}>Enquire About This Journey</Button>
              <Link className={styles.back} href={BACK_HREF}>← Back to all journeys</Link>
            </div>
          </Container>
        </section>
      )}

      {/* ── Highlights ── */}
      {pkg.highlights.length > 0 && (
        <section className={`${styles.section} ${styles.altSection}`}>
          <Container className={styles.bodyInner}>
            <h2 className={styles.sectionTitle}>Highlights</h2>
            <ul className={styles.bulletList}>
              {pkg.highlights.map((h) => (
                <li key={h.id}>{stripHtml(h.text)}</li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ── Itinerary ── */}
      {pkg.itinerary.length > 0 && (
        <section className={styles.section}>
          <Container className={styles.bodyInner}>
            <h2 className={styles.sectionTitle}>Day-by-Day Itinerary</h2>
            <ol className={styles.itineraryList}>
              {pkg.itinerary.map((day) => (
                <li key={day.id} className={styles.itineraryDay}>
                  <p className={styles.dayLabel}>Day {day.dayNumber}</p>
                  <p className={styles.dayTitle}>{stripHtml(day.title)}</p>
                  {day.description && (
                    <p className={styles.dayDesc}>{stripHtml(day.description)}</p>
                  )}
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {/* ── Inclusions / Exclusions ── */}
      {(inclusions.length > 0 || exclusions.length > 0) && (
        <section className={`${styles.section} ${styles.altSection}`}>
          <Container className={styles.bodyInner}>
            <div className={styles.inclExclGrid}>
              {inclusions.length > 0 && (
                <div>
                  <h2 className={styles.sectionTitle}>Inclusions</h2>
                  <ul className={styles.bulletList}>
                    {inclusions.map((i) => <li key={i.id}>{stripHtml(i.text)}</li>)}
                  </ul>
                </div>
              )}
              {exclusions.length > 0 && (
                <div>
                  <h2 className={styles.sectionTitle}>Exclusions</h2>
                  <ul className={`${styles.bulletList} ${styles.exclusionList}`}>
                    {exclusions.map((i) => <li key={i.id}>{stripHtml(i.text)}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ── Gallery ── */}
      {pkg.gallery.length > 0 && (
        <section className={styles.section}>
          <Container>
            <h2 className={styles.sectionTitle}>Gallery</h2>
            <div className={styles.gallery}>
              {pkg.gallery
                .filter((m) => m.type === "IMAGE")
                .map((m, i) => (
                  <div className={styles.galleryItem} key={m.id}>
                    <Image
                      alt={`${name} – photo ${i + 1}`}
                      src={m.url}
                      fill
                      sizes="(max-width: 767px) 90vw, (max-width: 1279px) 45vw, 30vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Dedicated Tour Inquiry Section ── */}
      <section className={styles.inquirySection} id="enquire">
        <Container className={styles.inquiryContainer}>
          <TourInquiryForm packageId={pkg.id} packageName={name} />
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaBand}>
        <Container className={styles.ctaInner}>
          <div>
            <p className={styles.eyebrow}>Ready to travel?</p>
            <h2 className={styles.ctaTitle}>Let us plan {name} for you</h2>
            <p className={styles.ctaText}>Share your travel dates and group size — we&apos;ll reply with a tailor-made itinerary.</p>
          </div>
          <div className={styles.ctaActions}>
            <Button href={INQUIRY_ANCHOR}>Send an Enquiry</Button>
            <Link className={styles.ctaGhost} href={HOLIDAY_HREF}>Customize my holiday</Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
