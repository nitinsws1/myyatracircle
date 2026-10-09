"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import RingMotif from "@/components/ui/RingMotif";
import styles from "./FinalCTA.module.css";

export default function FinalCTA() {
  return (
    <section aria-labelledby="final-cta-heading" className={styles.section}>
      <Image
        alt=""
        aria-hidden="true"
        src="/images/beyond-peru.jpg"
        fill
        sizes="100vw"
        className={styles.bgImage}
        style={{ objectFit: "cover", objectPosition: "center 30%" }}
      />
      <div aria-hidden="true" className={styles.scrim} />
      <RingMotif
        size={1100}
        color="rgba(216,185,120,0.2)"
        style={{ left: "50%", top: -700, marginLeft: -550 }}
      />
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className={styles.heading} id="final-cta-heading">
          Your next journey starts with a conversation.
        </h2>
        <p className={styles.sub}>Let&rsquo;s start with a conversation, not a checkout page.</p>
        <div className={styles.ctas}>
          <Button href="/#journey-finder">Plan Your Journey</Button>
          <Button href="/#contact" variant="secondary">
            Talk to an Expert
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
