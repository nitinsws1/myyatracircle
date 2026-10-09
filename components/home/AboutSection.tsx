"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import styles from "./AboutSection.module.css";

const PRINCIPLES = [
  { number: "01", title: "Planned Personally", body: "Every journey is shaped around the traveller." },
  { number: "02", title: "Connected Locally", body: "Experiences chosen with care and context." },
  { number: "03", title: "Supported Throughout", body: "One point of contact from planning to journey home." },
];

export default function AboutSection() {
  return (
    <section aria-labelledby="about-myc-heading" className={styles.section} id="about-myc">
      <Container width="wide">
        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.textCol}>
            <SectionLabel>About MYC</SectionLabel>
            <h2 className={styles.heading} id="about-myc-heading">
              We’ll plan your journey — you simply arrive.
            </h2>
            <p className={styles.body}>
              My Yatra Circle is an India-origin travel company building bespoke journeys across India and beyond.
              Our travel curators handle every detail — flights, stays, private access and the moments in between —
              so your trip is never templated, and never left to chance.
            </p>
            <ol className={styles.principles}>
              {PRINCIPLES.map((p) => (
                <li key={p.number} className={styles.principle}>
                  <span aria-hidden="true" className={styles.principleNumber}>
                    {p.number}
                  </span>
                  <span className={styles.principleText}>
                    <span className={styles.principleTitle}>{p.title}</span>
                    <span className={styles.principleBody}>{p.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className={styles.ctaRow}>
              <Button href="/#journey-finder">Plan Your Journey</Button>
              <Button href="/about" variant="tertiary" className={styles.storyLink}>
                Read Our Story
              </Button>
            </div>
          </div>
          <div className={styles.visualCol}>
            <div className={styles.visualFrame}>
              <Image
                alt="Travel-planning still life with camera and notebook overlooking the Amalfi coast"
                src="/images/journal-amalfi.jpg"
                fill
                sizes="(max-width: 1279px) 90vw, 38vw"
                style={{ objectFit: "cover" }}
              />
            </div>
            <p className={styles.visualCaption}>Every detail planned by hand, long before you leave.</p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
