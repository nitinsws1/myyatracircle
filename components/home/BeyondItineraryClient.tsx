"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import type { BeyondItem } from "@/lib/data";
import styles from "./BeyondItinerary.module.css";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

export default function BeyondItineraryClient({
  experiences,
  heading,
  subheading,
}: {
  experiences: BeyondItem[];
  heading?: string | null;
  subheading?: string | null;
}) {
  const [feature, ...remaining] = experiences;
  const pair = remaining.slice(0, 2);
  const closing = remaining[2];

  return (
    <section aria-labelledby="beyond-itinerary-heading" className={styles.section} id="beyond-itinerary">
      <Container width="editorial">
        <motion.div
          className={styles.headerRow}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <SectionLabel tone="gold">Signature Experiences</SectionLabel>
            <SectionHeading tone="white" id="beyond-itinerary-heading">
              {heading?.trim() || "Beyond the itinerary"}
            </SectionHeading>
            {subheading?.trim() && <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80">{subheading.trim()}</p>}
          </div>
          <Link className={styles.headerLink} href="/experiences">
            View All Experiences
            <span aria-hidden="true" className="cta-arrow">
              →
            </span>
          </Link>
        </motion.div>
      </Container>

      <Container width="wide" className={styles.composition}>
        {feature && <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
          <Link className={`${styles.feature} photo-hover`} href={`/experiences/${feature.slug}`}>
            <Image alt={feature.alt} src={feature.image} fill sizes="(max-width: 767px) 100vw, 1360px" className="photo-hover-img" style={{ objectFit: "cover" }} />
            <div aria-hidden="true" className={`${styles.featureScrim} photo-hover-scrim`} />
            <div className={styles.featureText}>
              <p className={styles.eyebrow}>{feature.eyebrow}</p>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.desc}</p>
              <span className={styles.link}>
                {feature.linkLabel}
                <span aria-hidden="true" className="cta-arrow">
                  →
                </span>
              </span>
            </div>
          </Link>
        </motion.div>}

        {pair.length > 0 && <div className={styles.pair}>
          {pair.map((experience, index) => (
          <motion.div key={experience.slug} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: index * 0.08 }}>
            <Link className={`${styles.pairItem} ${index === 0 ? styles.pairWide : styles.pairNarrow} photo-hover`} href={`/experiences/${experience.slug}`}>
              <div className={styles.pairImage}>
                <Image alt={experience.alt} src={experience.image} fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 90vw, 52vw" className="photo-hover-img" style={{ objectFit: "cover" }} />
              </div>
              <div className={styles.pairText}>
                <p className={styles.eyebrow}>{experience.eyebrow}</p>
                <h3 className={styles.itemTitle}>{experience.title}</h3>
                <p className={styles.itemDesc}>{experience.desc}</p>
                <span className={styles.link}>
                  {experience.linkLabel}
                  <span aria-hidden="true" className="cta-arrow">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </motion.div>
          ))}
        </div>}

        {closing && <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
          <Link className={`${styles.closing} photo-hover`} href={`/experiences/${closing.slug}`}>
            <div className={styles.closingImage}>
              <Image alt={closing.alt} src={closing.image} fill sizes="(max-width: 767px) 100vw, 1360px" className="photo-hover-img" style={{ objectFit: "cover" }} />
            </div>
            <div className={styles.closingText}>
              <p className={styles.eyebrow}>{closing.eyebrow}</p>
              <h3 className={styles.closingTitle}>{closing.title}</h3>
              <p className={styles.closingDesc}>{closing.desc}</p>
              <span className={styles.link}>
                {closing.linkLabel}
                <span aria-hidden="true" className="cta-arrow">
                  →
                </span>
              </span>
            </div>
          </Link>
        </motion.div>}
      </Container>
    </section>
  );
}
