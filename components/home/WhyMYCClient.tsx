"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import RingMotif from "@/components/ui/RingMotif";
import styles from "./WhyMYC.module.css";

const FALLBACK_PRINCIPLES = [
  {
    id: "local-knowledge",
    category: "Local Knowledge",
    heading: "Know the place beyond the postcard.",
    body: "Every journey is shaped by people who understand the places they recommend — from the right season to the moments worth making time for.",
  },
  {
    id: "personal-planning",
    category: "Personal Planning",
    heading: "Your journey begins with a conversation.",
    body: "We start by understanding how you like to travel, then shape the itinerary around your pace, interests and priorities.",
  },
  {
    id: "trusted-partners",
    category: "Trusted Partners",
    heading: "The right people make all the difference.",
    body: "We work with carefully chosen guides, drivers and properties because the people behind a journey matter as much as the places themselves.",
  },
  {
    id: "concierge-support",
    category: "Concierge Support",
    heading: "From the first conversation to the journey home.",
    body: "Thoughtful support throughout your trip, with one team keeping the details connected from beginning to end.",
  },
];

type Principle = {
  id: number;
  category: string;
  heading: string;
  body: string;
};

export default function WhyMYCClient({
  heading,
  subheading,
  principles,
}: {
  heading?: string | null;
  subheading?: string | null;
  principles: Principle[];
}) {
  const displayedPrinciples = principles.length > 0
    ? principles.map((item) => ({ ...item, category: "Our Approach" }))
    : FALLBACK_PRINCIPLES;

  return (
    <section aria-labelledby="why-myc-heading" className={styles.section} id="why-myc">
      <Container width="wide">
        <div className={styles.grid}>
          <RingMotif
            size={420}
            color="rgba(216,185,120,0.35)"
            style={{ right: 0, top: "50%", transform: "translateY(-50%)", zIndex: -1 }}
          />

          <motion.div
            className={styles.intro}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionLabel tone="gold">Why MYC</SectionLabel>
            <SectionHeading tone="white" id="why-myc-heading">
              {heading?.trim() || "The difference is in how you travel."}
            </SectionHeading>
            <p className={styles.paragraph}>
              {subheading?.trim() || "We believe the best journeys are not assembled from a list of places. They are shaped around the person taking them."}
            </p>
            <p className={styles.paragraph}>
              That means knowing when to slow down, what is worth making time for, and which details can turn a good
              trip into one you remember for years.
            </p>
            <p className={styles.statement}>Never templated. Always personal.</p>
            <div className={styles.imageWrap}>
              <Image
                alt="Traveller pausing over coffee on a veranda overlooking the Alleppey backwaters, Kerala"
                src="/images/about-kerala.jpg"
                fill
                sizes="(max-width: 1279px) 70vw, 30vw"
                style={{ objectFit: "cover", objectPosition: "22% 42%" }}
              />
            </div>
            <p className={styles.imageCaption}>Alleppey backwaters, Kerala</p>
          </motion.div>

          <ul className={styles.principles}>
            {displayedPrinciples.map((principle, index) => (
              <motion.li
                key={principle.id}
                className={styles.principle}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <span aria-hidden="true" className={styles.tick} />
                <div className={styles.principleContent}>
                  <p className={styles.category}>{principle.category}</p>
                  <h3 className={styles.principleHeading}>{principle.heading}</h3>
                  <p className={styles.principleBody}>{principle.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
