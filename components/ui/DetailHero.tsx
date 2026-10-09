import Image from "next/image";
import Container from "./Container";
import { Button } from "./Button";
import styles from "./DetailHero.module.css";

type DetailHeroProps = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  notice: string;
  ctaLabel: string;
  ctaHref: string;
  backLabel: string;
  backHref: string;
};

// Shared template for every destination/package/experience/blog
// detail page. These are intentionally simple placeholders — real
// day-by-day itineraries, pricing and long-form articles are still to be
// written by the MYC team, and the "notice" copy on each page says so
// honestly rather than inventing content. One template, fed by
// `src/lib/data.ts`, keeps all ~18 of these pages consistent.
export default function DetailHero({ image, alt, eyebrow, title, notice, ctaLabel, ctaHref, backLabel, backHref }: DetailHeroProps) {
  return (
    <main id="main-content">
      <div className={styles.media}>
        <Image src={image} alt={alt} fill sizes="100vw" style={{ objectFit: "cover" }} priority />
        <div aria-hidden="true" className={styles.scrim} />
        <Container className={styles.mediaCaption}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
        </Container>
      </div>
      <section className={styles.body}>
        <Container className={styles.bodyInner}>
          <p className={styles.notice}>{notice}</p>
          <div className={styles.actions}>
            <Button href={ctaHref}>{ctaLabel}</Button>
            <a className={styles.back} href={backHref}>
              ← {backLabel}
            </a>
          </div>
        </Container>
      </section>
    </main>
  );
}
