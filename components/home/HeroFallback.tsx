"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import styles from "./Hero.module.css";

export default function HeroFallback() {
  return (
    <section aria-label="Introduction" className={styles.hero}>
      <Image
        alt="Woman on a balcony overlooking Lake Pichola and the City Palace in Udaipur at golden hour"
        src="/images/hero-rajasthan.jpg"
        fill
        priority
        sizes="100vw"
        className={styles.image}
      />
      <div aria-hidden="true" className={styles.scrim} />
      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.eyebrow}>Curated Journeys, Worldwide</p>
          <h1 className={styles.headline}>
            Travel the world
            <br />
            inside your circle.
          </h1>
          <p className={styles.subhead}>
            Bespoke itineraries, concierge support and journeys planned entirely around you — never templated, always
            personal.
          </p>
          <div className={styles.ctas}>
            <Button href="/#journey-finder">Plan Your Journey</Button>
            <Button href="/#destinations" variant="secondary">
              Explore Destinations
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
