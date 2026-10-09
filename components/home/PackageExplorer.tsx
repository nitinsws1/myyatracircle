"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import PackageCard from "./PackageCard";
import { packages } from "@/lib/data";
import styles from "./PackageExplorer.module.css";

const AUTO_SCROLL_INTERVAL_MS = 4200;

type DurationFilter = "all" | "short" | "medium" | "long";

function matchesDuration(nights: number, filter: DurationFilter) {
  if (filter === "all") return true;
  if (filter === "short") return nights <= 7;
  if (filter === "medium") return nights >= 8 && nights <= 9;
  return nights >= 10;
}

export default function PackageExplorer() {
  const [region, setRegion] = useState<"all" | "india" | "international">("all");
  const [duration, setDuration] = useState<DurationFilter>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const filtered = useMemo(
    () =>
      packages.filter((pkg) => (region === "all" ? true : pkg.region === region) && matchesDuration(pkg.nightsCount, duration)),
    [region, duration]
  );

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(`[data-package-card="true"]`);
    const step = (item?.offsetWidth ?? 320) + 28;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  function scrollToIndex(index: number) {
    const el = trackRef.current;
    if (!el) return;
    const item = el.querySelectorAll<HTMLElement>(`[data-package-card="true"]`)[index];
    if (item) el.scrollTo({ left: item.offsetLeft, behavior: "smooth" });
  }

  // Reset to the first card whenever a filter changes. Done here, from the
  // event handlers that change `region`/`duration` (see the filter chip
  // onClick handlers below), rather than in an effect keyed on those values —
  // calling setState synchronously inside an effect body causes an extra,
  // avoidable render pass.
  function resetToStart() {
    setActiveIndex(0);
    trackRef.current?.scrollTo({ left: 0 });
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function onScroll() {
      const items = Array.from(el!.querySelectorAll<HTMLElement>(`[data-package-card="true"]`));
      const idx = items.findIndex((item) => Math.abs(item.offsetLeft - el!.scrollLeft) < item.offsetWidth / 2);
      if (idx >= 0) setActiveIndex(idx);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [filtered.length]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (filtered.length <= 1) return;
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
  }, [prefersReducedMotion, filtered.length]);

  function pauseAutoScroll() {
    isPausedRef.current = true;
  }
  function resumeAutoScroll() {
    isPausedRef.current = false;
  }

  const atStart = activeIndex === 0;
  const atEnd = activeIndex >= filtered.length - 1;

  return (
    <section aria-labelledby="journey-finder-heading" className={styles.section} id="journey-finder">
      <Container width="wide" className={styles.headerRow}>
        <div className={styles.headerMain}>
          <div className={styles.eyebrowRow}>
            <SectionLabel className={styles.eyebrow}>Explore Journeys</SectionLabel>
            <span aria-hidden="true" className={styles.eyebrowLine} />
          </div>
          <SectionHeading id="journey-finder-heading" className={styles.heading}>
            Journeys worth taking
          </SectionHeading>
          <p className={styles.supporting}>Explore handpicked journeys across India and beyond.</p>
          <div className={styles.filterRow}>
            <div aria-label="Filter by destination type" className={styles.filterGroup} role="group">
              <button
                aria-pressed={region === "international"}
                className={`${styles.filterChip} ${region === "international" ? styles.filterChipActive : ""}`}
                type="button"
                onClick={() => {
                  setRegion((r) => (r === "international" ? "all" : "international"));
                  resetToStart();
                }}
              >
                International
              </button>
              <button
                aria-pressed={region === "india"}
                className={`${styles.filterChip} ${region === "india" ? styles.filterChipActive : ""}`}
                type="button"
                onClick={() => {
                  setRegion((r) => (r === "india" ? "all" : "india"));
                  resetToStart();
                }}
              >
                Within India
              </button>
            </div>
            <span aria-hidden="true" className={styles.filterDivider} />
            <div aria-label="Filter by duration" className={styles.filterGroup} role="group">
              {(
                [
                  { key: "all", label: "All Durations" },
                  { key: "short", label: "Up to 7 Nights" },
                  { key: "medium", label: "8 – 9 Nights" },
                  { key: "long", label: "10+ Nights" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  aria-pressed={duration === opt.key}
                  className={`${styles.filterChip} ${duration === opt.key ? styles.filterChipActive : ""}`}
                  type="button"
                  onClick={() => {
                    setDuration(opt.key);
                    resetToStart();
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button href="/packages" variant="tertiary" className={styles.viewAllTop}>
          View All Journeys
        </Button>
      </Container>

      <Container width="wide">
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No journeys match these filters yet — try a different combination, or tell us what you have in mind.</p>
            <Button href="/#contact" variant="secondaryDark">
              Talk to an Expert
            </Button>
          </div>
        ) : (
          <div
            className={styles.carouselWrap}
            onMouseEnter={pauseAutoScroll}
            onMouseLeave={resumeAutoScroll}
            onFocus={pauseAutoScroll}
            onBlur={resumeAutoScroll}
            onTouchStart={pauseAutoScroll}
            onTouchEnd={resumeAutoScroll}
          >
            <div className={styles.track} ref={trackRef}>
              {filtered.map((pkg) => (
                <div className={styles.trackItem} data-package-card="true" key={pkg.slug}>
                  <PackageCard package={pkg} variant="editorial" sizes="(max-width: 767px) 92vw, (max-width: 1279px) 46vw, 23vw" />
                </div>
              ))}
            </div>
            <div className={styles.controlRow}>
              <div aria-label="Package page" className={styles.dots} role="tablist">
                {filtered.map((pkg, i) => (
                  <button
                    key={pkg.slug}
                    aria-label={`Show ${pkg.title}`}
                    aria-selected={i === activeIndex}
                    className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ""}`}
                    role="tab"
                    type="button"
                    onClick={() => scrollToIndex(i)}
                  />
                ))}
              </div>
              <div className={styles.navRow}>
                <button aria-label="Previous package" className={styles.navBtn} disabled={atStart} type="button" onClick={() => scrollByCard(-1)}>
                  <ArrowIcon direction="left" />
                </button>
                <button
                  aria-label="Next package"
                  className={`${styles.navBtn} ${styles.navBtnPrimary}`}
                  disabled={atEnd}
                  type="button"
                  onClick={() => scrollByCard(1)}
                >
                  <ArrowIcon direction="right" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  const d = direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7";
  return (
    <svg aria-hidden="true" fill="none" height="16" width="16" viewBox="0 0 24 24">
      <path d={d} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
