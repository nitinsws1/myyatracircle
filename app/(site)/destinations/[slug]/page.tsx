import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cleanHtml, stripHtml } from "@/lib/html";
import { getDestinationBySlug } from "@/lib/site-data";
import styles from "./page.module.css";

/* ───────────────────────── Routes (edit here if your paths differ) ───────────────────────── */
const ROUTES = {
  destinations: "/destinations",
  destination: (slug: string) => `/destinations/${slug}`,
  tourPackage: (slug: string) => `/packages/${slug}`,
  experience: (slug: string) => `/experiences/${slug}`,
  contact: (destination: string) => `/contact?destination=${encodeURIComponent(destination)}`,
  // Places have no detail page yet, so a place card opens the enquiry form pre-filled with that place.
  placeEnquiry: (destination: string, place: string) => `/contact?destination=${encodeURIComponent(`${place}, ${destination}`)}`,
  customHoliday: (destination: string) => `/customized-holidays?destination=${encodeURIComponent(destination)}`,
  journeyFinder: "/#journey-finder",
} as const;

/* ───────────────────────── Types ───────────────────────── */
type MediaType = "IMAGE" | "VIDEO";
type MediaAsset = { id: number | string; url: string; type: MediaType };

/* ───────────────────────── Helpers ───────────────────────── */
function uniqueByUrl(assets: MediaAsset[]): MediaAsset[] {
  const seen = new Set<string>();
  return assets.filter((asset) => {
    if (!asset.url || seen.has(asset.url)) return false;
    seen.add(asset.url);
    return true;
  });
}

function getMediaAssets(
  id: number,
  thumbnailImage: string | null,
  heroImage: string | null,
  heroType: MediaType,
  gallery: MediaAsset[],
): MediaAsset[] {
  return uniqueByUrl([
    ...(thumbnailImage ? [{ id: `thumbnail-${id}`, url: thumbnailImage, type: "IMAGE" as const }] : []),
    ...(heroImage ? [{ id: `hero-${id}`, url: heroImage, type: heroType }] : []),
    ...gallery,
  ]);
}

/** Plain-text preview of rich HTML. Adds a space between block elements so paragraphs don't glue together. */
function excerpt(html: string | null | undefined, max = 170): string {
  const text = stripHtml((html ?? "").replace(/<\/(p|li|h[1-6]|div|blockquote)>|<br\s*\/?>/gi, " $&")).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function formatDuration(days: number | null, nights: number | null): string {
  return [days ? `${days} ${days === 1 ? "day" : "days"}` : null, nights != null ? `${nights} ${nights === 1 ? "night" : "nights"}` : null]
    .filter(Boolean)
    .join(" · ");
}

function bySortThenName<T extends { sortOrder?: number; name: string }>(a: T, b: T) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);
}

/* ───────────────────────── UI pieces ───────────────────────── */
function Media({ asset, alt, hero = false, poster }: { asset: MediaAsset; alt: string; hero?: boolean; poster?: string }) {
  return asset.type === "VIDEO" ? (
    <video
      aria-label={alt}
      autoPlay={hero}
      controls={!hero}
      loop={hero}
      muted={hero}
      playsInline
      preload={hero ? "auto" : "metadata"}
      poster={poster}
      className={styles.mediaAsset}
      src={asset.url}
    />
  ) : (
    <Image
      alt={alt}
      className={styles.mediaAsset}
      fill
      priority={hero}
      sizes={hero ? "100vw" : "(max-width: 767px) 90vw, (max-width: 1279px) 45vw, 30vw"}
      src={asset.url}
      style={{ objectFit: "cover" }}
    />
  );
}

function RichText({ html, className }: { html: string | null; className?: string }) {
  const sanitized = cleanHtml(html);
  if (!sanitized) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

/** Eyebrow + title (+ optional count). One consistent heading pattern for every section. */
function SectionHead({ eyebrow, title, id, meta }: { eyebrow: string; title: string; id: string; meta?: string }) {
  return (
    <header className={styles.sectionHead}>
      <div>
        <p className={styles.sectionEyebrow}>{eyebrow}</p>
        <h2 className={styles.sectionTitle} id={id}>{title}</h2>
      </div>
      {meta ? <p className={styles.sectionMeta}>{meta}</p> : null}
    </header>
  );
}

/** One cover photo per card: the first image only (videos are skipped so a card never shows a player). */
function CardCover({ assets }: { assets: MediaAsset[] }) {
  const cover = assets.find((asset) => asset.type === "IMAGE");
  return (
    <div className={styles.cover}>
      {cover ? <Media asset={cover} alt="" /> : <div aria-hidden="true" className={styles.coverEmpty} />}
    </div>
  );
}

/* ───────────────────────── Metadata ───────────────────────── */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return { title: "Destination not found | My Yatra Circle", robots: { index: false } };

  const name = stripHtml(destination.name);
  const description = stripHtml(destination.metaDescription) || excerpt(destination.shortDescription ?? destination.overview, 160) || undefined;
  const keywords = destination.metaKeywords?.split(",").map((k) => k.trim()).filter(Boolean);
  const ogImage = [destination.bannerType === "IMAGE" ? destination.bannerImage : null, destination.thumbnailImage].find(Boolean);

  return {
    title: stripHtml(destination.metaTitle) || `${name} | My Yatra Circle`,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: { canonical: ROUTES.destination(destination.slug) },
    openGraph: {
      type: "website",
      title: stripHtml(destination.metaTitle) || name,
      description,
      images: ogImage ? [{ url: ogImage, alt: name }] : undefined,
    },
    twitter: { card: ogImage ? "summary_large_image" : "summary", title: name, description, images: ogImage ? [ogImage] : undefined },
  };
}

/* ───────────────────────── Page ───────────────────────── */
export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug); // React cache(): shared with generateMetadata, 1 DB hit
  if (!destination) notFound();

  const name = stripHtml(destination.name);
  const location = [destination.region, destination.state].map((v) => stripHtml(v)).filter(Boolean).join(" · ");

  // Hero = banner (image or video) → falls back to thumbnail → first gallery item
  const destinationMedia = uniqueByUrl([
    ...(destination.bannerImage ? [{ id: "banner", url: destination.bannerImage, type: destination.bannerType }] : []),
    ...(destination.thumbnailImage ? [{ id: "thumbnail", url: destination.thumbnailImage, type: "IMAGE" as const }] : []),
    ...destination.gallery,
  ]);
  const heroAsset = destinationMedia[0];
  const galleryAssets = destinationMedia.slice(1);

  const packages = destination.packages
    .map(({ package: item }) => item)
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || bySortThenName({ sortOrder: a.sortOrder, name: a.name }, { sortOrder: b.sortOrder, name: b.name }));
  const experiences = destination.experiences
    .map(({ experience: item }) => item)
    .sort(bySortThenName);
  const places = destination.places;

  const hasOverview = Boolean(stripHtml(destination.overview));
  const hasIntroText = hasOverview || Boolean(destination.shortDescription);
  const sectionLinks = [
    galleryAssets.length > 0 && { id: "destination-gallery-heading", label: "Gallery" },
    places.length > 0 && { id: "destination-places-heading", label: "Places to discover" },
    packages.length > 0 && { id: "destination-packages-heading", label: "Journeys" },
    experiences.length > 0 && { id: "destination-experiences-heading", label: "Experiences" },
  ].filter((link): link is { id: string; label: string } => Boolean(link));

  const stats = [
    places.length > 0 && { value: places.length, label: places.length === 1 ? "Place to discover" : "Places to discover" },
    packages.length > 0 && { value: packages.length, label: packages.length === 1 ? "Curated journey" : "Curated journeys" },
    experiences.length > 0 && { value: experiences.length, label: experiences.length === 1 ? "Experience" : "Experiences" },
  ].filter((stat): stat is { value: number; label: string } => Boolean(stat));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name,
    description: excerpt(destination.shortDescription ?? destination.overview, 300) || undefined,
    image: destinationMedia.filter((m) => m.type === "IMAGE").slice(0, 5).map((m) => m.url),
    touristType: "Leisure travellers",
    containsPlace: places.map((place) => ({ "@type": "TouristAttraction", name: stripHtml(place.name) })),
  };

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        // "<" escaped so CMS text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* ── 1. Hero: full-bleed media, breadcrumb on top, headline anchored bottom-left ── */}
      <section className={styles.hero}>
        {heroAsset ? <Media asset={heroAsset} alt={name} hero poster={destination.thumbnailImage ?? undefined} /> : null}
        <div aria-hidden="true" className={styles.heroScrim} />
        <Container className={styles.heroInner}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href={ROUTES.destinations}>Destinations</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{name}</span>
          </nav>

          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{location || "Explore Destination"}</p>
            <h1 className={styles.title}>{name}</h1>
            {destination.shortDescription ? <p className={styles.heroDescription}>{stripHtml(destination.shortDescription)}</p> : null}
          </div>
        </Container>
      </section>

      <section className={styles.intro}>
        <Container>
          {/* ── 2. Fact bar: floats over the hero edge, holds the primary CTA ── */}
          <div className={styles.factBar}>
            {stats.length > 0 ? (
              <dl className={styles.stats}>
                {stats.map((stat) => (
                  <div className={styles.stat} key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={styles.factText}>Thinking of {name}? Tell us what you have in mind.</p>
            )}
            <Button href={ROUTES.contact(name)}>Plan a Journey Here</Button>
          </div>

          {/* ── 3. Overview: narrow reading column + sticky "on this page" rail ── */}
          {hasIntroText || sectionLinks.length > 1 ? (
            <div className={styles.introGrid}>
              <aside className={styles.aside}>
                {sectionLinks.length > 1 ? (
                  <nav aria-label="On this page" className={styles.toc}>
                    <p className={styles.tocLabel}>On this page</p>
                    {sectionLinks.map((link) => (
                      <a className={styles.tocLink} href={`#${link.id}`} key={link.id}>{link.label}</a>
                    ))}
                  </nav>
                ) : null}
                <Link className={styles.back} href={ROUTES.destinations}>← All destinations</Link>
              </aside>

              {hasIntroText ? (
                <div className={styles.introBody}>
                  <p className={styles.sectionEyebrow}>Overview</p>
                  <h2 className={styles.sectionTitle}>About {name}</h2>
                  {hasOverview ? (
                    <RichText html={destination.overview} className={styles.richText} />
                  ) : (
                    <p className={styles.richText}>{stripHtml(destination.shortDescription)}</p>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </Container>
      </section>

      {/* ── 4. Gallery: bento mosaic (one large lead image, varied rhythm) ── */}
      {galleryAssets.length > 0 ? (
        <section aria-labelledby="destination-gallery-heading" className={styles.section}>
          <Container>
            <SectionHead eyebrow="Gallery" title="Destination gallery" id="destination-gallery-heading" />
            <div className={styles.gallery}>
              {galleryAssets.map((asset, index) => (
                <div className={styles.galleryItem} key={asset.id}>
                  <Media asset={asset} alt={`${name} – photo ${index + 1}`} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── 5. Places: image-led tiles, whole tile is a link ── */}
      {places.length > 0 ? (
        <section aria-labelledby="destination-places-heading" className={`${styles.section} ${styles.alternateSection}`}>
          <Container>
            <SectionHead
              eyebrow="Highlights"
              title="Places to discover"
              id="destination-places-heading"
              meta={`${places.length} ${places.length === 1 ? "place" : "places"}`}
            />
            <div className={styles.tiles}>
              {places.map((place) => {
                const media = getMediaAssets(place.id, place.thumbnailImage, place.heroImage, place.heroType, place.gallery);
                const placeName = stripHtml(place.name);
                const about = excerpt(place.about, 140);
                return (
                  <article className={styles.tile} key={place.id}>
                    <CardCover assets={media} />
                    <div aria-hidden="true" className={styles.tileScrim} />
                    <span aria-hidden="true" className={styles.tileArrow}>↗</span>
                    <div className={styles.tileBody}>
                      <h3 className={styles.tileTitle}>
                        <Link
                          aria-label={`Plan a visit to ${placeName}`}
                          className={styles.stretch}
                          href={ROUTES.placeEnquiry(name, placeName)}
                        >
                          {placeName}
                        </Link>
                      </h3>
                      {about ? <p className={styles.tileText}>{about}</p> : null}
                      <span aria-hidden="true" className={styles.tileCta}>Plan a visit <span className={styles.arrow}>→</span></span>
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── 6. Related tour packages ── */}
      <section aria-labelledby="destination-packages-heading" className={styles.section} id="journeys">
        <Container>
          <SectionHead
            eyebrow="Journeys"
            title={`Journeys in ${name}`}
            id="destination-packages-heading"
            meta={packages.length > 0 ? `${packages.length} ${packages.length === 1 ? "journey" : "journeys"}` : undefined}
          />
          {packages.length > 0 ? (
            <div className={styles.cards}>
              {packages.map((item) => {
                const media = getMediaAssets(item.id, item.thumbnailImage, item.heroImage, item.heroType, item.gallery);
                const duration = formatDuration(item.durationDays, item.durationNights);
                const itemName = stripHtml(item.name);
                const summary = stripHtml(item.shortDescription);
                const highlights = item.highlights.slice(0, 3);
                return (
                  <article className={styles.card} key={item.id}>
                    <div className={styles.coverWrap}>
                      <CardCover assets={media} />
                      {item.isFeatured || duration ? (
                        <div className={styles.chips}>
                          {item.isFeatured ? <span className={styles.chipFeatured}>Featured</span> : null}
                          {duration ? <span className={styles.chip}>{duration}</span> : null}
                        </div>
                      ) : null}
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>
                        <Link className={styles.stretch} href={ROUTES.tourPackage(item.slug)}>{itemName}</Link>
                      </h3>
                      {summary ? <p className={styles.cardDescription}>{summary}</p> : null}
                      {highlights.length > 0 ? (
                        <ul className={styles.detailList}>
                          {highlights.map((highlight) => <li key={highlight.id}>{stripHtml(highlight.text)}</li>)}
                        </ul>
                      ) : null}
                      <span aria-hidden="true" className={styles.cardFoot}>View details <span className={styles.arrow}>→</span></span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>We&apos;re putting the finishing touches on ready-made journeys for {name}. Tell us what you have in mind and we&apos;ll design one around you.</p>
              <Link className={styles.cardLink} href={ROUTES.customHoliday(name)}>
                Request a customized holiday <span aria-hidden="true" className={styles.arrow}>→</span>
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* ── 7. Related experiences ── */}
      {experiences.length > 0 ? (
        <section aria-labelledby="destination-experiences-heading" className={`${styles.section} ${styles.alternateSection}`}>
          <Container>
            <SectionHead
              eyebrow="Experiences"
              title={`Experiences in ${name}`}
              id="destination-experiences-heading"
              meta={`${experiences.length} ${experiences.length === 1 ? "experience" : "experiences"}`}
            />
            <div className={styles.cards}>
              {experiences.map((item) => {
                const media = getMediaAssets(item.id, item.thumbnailImage, item.heroImage, item.heroType, item.gallery);
                const itemName = stripHtml(item.name);
                const summary = stripHtml(item.shortDescription) || excerpt(item.overview, 170);
                const highlights = item.highlights.slice(0, 3);
                return (
                  <article className={styles.card} key={item.id}>
                    <div className={styles.coverWrap}>
                      <CardCover assets={media} />
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>
                        <Link className={styles.stretch} href={ROUTES.experience(item.slug)}>{itemName}</Link>
                      </h3>
                      {summary ? <p className={styles.cardDescription}>{summary}</p> : null}
                      {highlights.length > 0 ? (
                        <ul className={styles.detailList}>
                          {highlights.map((highlight) => <li key={highlight.id}>{stripHtml(highlight.text)}</li>)}
                        </ul>
                      ) : null}
                      <span aria-hidden="true" className={styles.cardFoot}>View details <span className={styles.arrow}>→</span></span>
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── 8. Inquiry CTA ── */}
      <section aria-labelledby="destination-cta-heading" className={styles.ctaBand}>
        <Container className={styles.ctaInner}>
          <div className={styles.ctaCopy}>
            <p className={styles.eyebrow}>Ready when you are</p>
            <h2 className={styles.ctaTitle} id="destination-cta-heading">Plan your trip to {name}</h2>
            <p className={styles.ctaText}>Share your dates, group size and budget — our travel experts will reply with a tailor-made itinerary.</p>
          </div>
          <div className={styles.ctaActions}>
            <Button href={ROUTES.contact(name)}>Send an Enquiry</Button>
            <Link className={styles.ctaGhost} href={ROUTES.customHoliday(name)}>Customize my holiday</Link>
          </div>
        </Container>
      </section>
    </main>
  );
}