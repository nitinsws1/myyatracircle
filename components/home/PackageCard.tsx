import Image from "next/image";
import Link from "next/link";
import type { Package } from "@/lib/data";
import RingMotif from "@/components/ui/RingMotif";
import styles from "./PackageCard.module.css";

type Variant = "default" | "editorial" | "hero" | "compact";

type PackageCardProps = {
  package: Package;
  variant?: Variant;
  showRing?: boolean;
  sizes?: string;
};

const variantClass: Record<Variant, string> = {
  default: "",
  editorial: styles.cardEditorial,
  hero: styles.cardHero,
  compact: styles.cardCompact,
};

// The one package card used across the homepage's "Journeys worth taking"
// carousel (editorial), "Featured Journeys" hero + supporting grid (hero /
// compact), and the /packages index page (default) — variant only changes
// the CSS modifier class, never the markup shape.
export default function PackageCard({ package: pkg, variant = "default", showRing, sizes }: PackageCardProps) {
  const isEditorial = variant === "editorial";
  const titleClass = isEditorial ? styles.titleEditorial : styles.title;
  const linkClass = isEditorial ? `${styles.link} ${styles.linkEditorial}` : styles.link;

  return (
    <article className={`${styles.card} ${variantClass[variant]}`}>
      <Link aria-label={`View journey: ${pkg.title}`} className={`${styles.mediaLink} photo-hover`} href={`/packages/${pkg.slug}`}>
        <div className={styles.media}>
          <Image
            alt={pkg.alt}
            src={pkg.image}
            fill
            sizes={sizes ?? "(max-width: 767px) 92vw, (max-width: 1279px) 46vw, 23vw"}
            className={`${styles.image} photo-hover-img`}
          />
          <div aria-hidden="true" className={`${styles.scrim} photo-hover-scrim`} />
          {showRing ? <RingMotif size={440} color="rgba(255,255,255,0.22)" style={{ right: -170, top: -170 }} /> : null}
        </div>
      </Link>
      <div className={styles.body}>
        {variant === "hero" || variant === "compact" || variant === "default" ? (
          <p className={styles.typeTag}>{pkg.typeTag}</p>
        ) : null}
        <p className={isEditorial ? styles.metaEditorial : styles.eyebrow}>
          {isEditorial ? (
            <>
              {pkg.place} · {pkg.nights}
            </>
          ) : variant === "compact" ? (
            <>
              {pkg.typeTag} · {pkg.place} · {pkg.nights}
            </>
          ) : (
            <>
              {pkg.place} · {pkg.nights}
            </>
          )}
        </p>
        <h3 className={titleClass}>{pkg.title}</h3>
        {variant !== "compact" ? <p className={isEditorial ? styles.descEditorial : styles.desc}>{pkg.desc}</p> : null}
        <Link className={linkClass} href={`/packages/${pkg.slug}`}>
          View Journey
          <span aria-hidden="true" className="cta-arrow">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
