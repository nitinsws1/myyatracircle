"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import styles from "./DestinationGrid.module.css";

const AUTO_SCROLL_INTERVAL_MS = 4200;

type DestinationCard = {
  slug: string;
  name: string;
  image: string;
  alt: string;
};

export default function DestinationGridClient({
  destinations,
  heading,
  subheading,
}: {
  destinations: DestinationCard[];
  heading: string;
  subheading: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(`[data-card="true"]`);
    const step = (card?.offsetWidth ?? 300) + 24;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    return () => el.removeEventListener("scroll", updateEdges);
  }, [destinations.length]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (destinations.length <= 1) return;
    autoScrollTimerRef.current = setInterval(() => {
      const el = trackRef.current;
      if (!el || isPausedRef.current) return;
      const atEndNow = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEndNow) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard(1);
      }
    }, AUTO_SCROLL_INTERVAL_MS);
    return () => {
      if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    };
  }, [destinations.length, prefersReducedMotion]);

  function pauseAutoScroll() {
    isPausedRef.current = true;
  }
  function resumeAutoScroll() {
    isPausedRef.current = false;
  }

  return (
    <section aria-labelledby="destinations-heading" className={styles.section} id="destinations">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Container width="editorial" className={styles.headerRow}>
          <SectionLabel>Explore Destinations</SectionLabel>
          <div className={styles.headerFlex}>
            <SectionHeading id="destinations-heading" className={styles.heading}>
              {heading}
            </SectionHeading>
            <div className={styles.intro}>
              <p className={styles.introText}>{subheading}</p>
              <Button href="/destinations" variant="tertiary">
                View All Destinations
              </Button>
            </div>
          </div>
        </Container>
      </motion.div>

      <Container width="wide">
        <motion.div
          className={styles.carouselWrap}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={pauseAutoScroll}
          onMouseLeave={resumeAutoScroll}
          onFocus={pauseAutoScroll}
          onBlur={resumeAutoScroll}
          onTouchStart={pauseAutoScroll}
          onTouchEnd={resumeAutoScroll}
        >
          <div className={styles.track} ref={trackRef}>
            {destinations.map((d) => (
              <Link key={d.slug} className={`${styles.card} photo-hover`} data-card="true" href={`/destinations/${d.slug}`}>
                <div className={styles.cardImage}>
                  <Image
                    alt={d.alt}
                    src={d.image}
                    fill
                    sizes="(max-width: 767px) 78vw, (max-width: 1279px) 40vw, 22vw"
                    className="photo-hover-img"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
                <p className={styles.cardName}>{d.name}</p>
              </Link>
            ))}
          </div>
          {destinations.length > 1 && (
            <div className={styles.navRow}>
              <button
                aria-label="Previous destination"
                className={styles.navBtn}
                disabled={atStart}
                type="button"
                onClick={() => scrollByCard(-1)}
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                aria-label="Next destination"
                className={`${styles.navBtn} ${styles.navBtnPrimary}`}
                disabled={atEnd}
                type="button"
                onClick={() => scrollByCard(1)}
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  const d = direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7";
  return (
    <svg aria-hidden="true" fill="none" height="18" width="18" viewBox="0 0 24 24">
      <path d={d} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
