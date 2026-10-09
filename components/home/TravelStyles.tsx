"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import AtmoFrame from "@/components/ui/AtmoFrame";
import RingMotif from "@/components/ui/RingMotif";
import { travelStyles } from "@/lib/data";
import styles from "./TravelStyles.module.css";

export default function TravelStyles() {
  const [activeSlug, setActiveSlug] = useState(travelStyles[0].slug);
  const baseId = useId();
  const active = travelStyles.find((s) => s.slug === activeSlug) ?? travelStyles[0];

  return (
    <section aria-labelledby="travel-styles-heading" className={styles.section} id="travel-styles">
      <Container width="editorial" className={styles.headerRow}>
        <div className={styles.headerFlex}>
          <div>
            <SectionLabel>Travel Your Way</SectionLabel>
            <SectionHeading id="travel-styles-heading">A style of travel for every traveller</SectionHeading>
          </div>
          <Button href="/experiences" variant="tertiary">
            View All Travel Styles
          </Button>
        </div>
      </Container>

      <Container width="wide">
        <div className={styles.grid}>
          <div aria-label="Travel styles" className={styles.tabs} role="tablist">
            {travelStyles.map((s) => {
              const isActive = s.slug === activeSlug;
              return (
                <button
                  key={s.slug}
                  aria-controls={`${baseId}-panel`}
                  aria-selected={isActive}
                  className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                  id={`${baseId}-tab-${s.slug}`}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                  onClick={() => setActiveSlug(s.slug)}
                >
                  <span className={styles.tabThumb}>
                    <Image
                      alt=""
                      src={s.image}
                      fill
                      sizes="64px"
                      style={{ objectFit: "cover", objectPosition: s.imagePosition ?? "center" }}
                    />
                  </span>
                  <span className={styles.tabText}>
                    <span className={styles.tabIndex}>{s.index}</span>
                    <span className={styles.tabName}>{s.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            aria-labelledby={`${baseId}-tab-${active.slug}`}
            className={`${styles.stage} photo-hover`}
            id={`${baseId}-panel`}
            role="tabpanel"
          >
            <AtmoFrame className={styles.stageFrame}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.slug}
                  className={styles.stageMedia}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    alt={active.alt}
                    src={active.image}
                    fill
                    sizes="(max-width: 767px) 92vw, (max-width: 1279px) 90vw, 62vw"
                    className="photo-hover-img"
                    style={{ objectFit: "cover", objectPosition: active.imagePosition ?? "center" }}
                  />
                </motion.div>
              </AnimatePresence>
              <div
                aria-hidden="true"
                className="photo-hover-scrim"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0) 46%)",
                }}
              />
              <RingMotif size={900} color="rgba(255,255,255,0.2)" style={{ left: -360, top: -340 }} />
              <div className={styles.caption}>
                <p className={styles.overline}>{active.overline}</p>
                <h3 className={styles.title}>{active.name}</h3>
                <p className={styles.desc}>{active.desc}</p>
                <Link href={`/experiences/${active.slug}`} className={styles.cta}>
                  Explore {active.name}
                  <span aria-hidden="true" className="cta-arrow">
                    →
                  </span>
                </Link>
              </div>
            </AtmoFrame>
          </div>
        </div>
      </Container>
    </section>
  );
}
