"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import { Button, ActionButton } from "@/components/ui/Button";
import type { Blog } from "@/lib/data";
import styles from "./FeaturedBlogs.module.css";

export default function FeaturedBlogsClient({
  blogs,
  heading,
  subheading,
}: {
  blogs: Blog[];
  heading?: string | null;
  subheading?: string | null;
}) {
  const [featured, ...rest] = blogs;
  const emailId = useId();
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitted");
  }

  return (
    <section aria-labelledby="journal-heading" className={styles.section} id="journal">
      <Container width="editorial">
        <motion.div
          className={styles.headerRow}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <SectionLabel tone="gold-dark">Journal</SectionLabel>
            <SectionHeading id="journal-heading">{heading?.trim() || "Stories worth travelling for."}</SectionHeading>
            <p className={styles.intro}>
              {subheading?.trim() || "Places to know, stories to savour, and ideas for journeys worth taking."}
            </p>
          </div>
          <Button href="/blogs" variant="tertiary">
            Visit the Journal
          </Button>
        </motion.div>
      </Container>

      <Container width="wide" className={styles.grid}>
        <motion.div
          className={styles.spotlight}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <Link className={`${styles.featured} photo-hover`} href={`/blogs/${featured.slug}`}>
            <div className={styles.featuredMedia}>
              <Image
                alt={featured.alt}
                src={featured.image}
                fill
                sizes="(max-width: 1023px) 92vw, 52vw"
                className="photo-hover-img"
                style={{ objectFit: "cover" }}
              />
              <div aria-hidden="true" className={styles.featuredScrim} />
            </div>
            <div className={styles.featuredText}>
              <p className={styles.featuredCategory}>
                {featured.category} · {featured.date}
              </p>
              <h3 className={styles.featuredTitle}>{featured.title}</h3>
              <div className={styles.featuredMeta}>
                <span className={styles.readMore}>
                  Read the Story
                  <span aria-hidden="true" className="cta-arrow">
                    →
                  </span>
                </span>
              </div>
            </div>
          </Link>

          <div className={styles.list}>
            {rest.map((blog) => (
              <Link key={blog.slug} className={`${styles.listItem} photo-hover`} href={`/blogs/${blog.slug}`}>
                <div className={styles.listMedia}>
                  <Image
                    alt={blog.alt}
                    src={blog.image}
                    fill
                    sizes="110px"
                    className="photo-hover-img"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className={styles.listBody}>
                  <p className={styles.listCategory}>
                    {blog.category} · {blog.date}
                  </p>
                  <h4 className={styles.listTitle}>{blog.title}</h4>
                  <p className={styles.listSummary}>{blog.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </Container>

      <Container width="editorial" className={styles.newsletterWrap}>
        <form className={styles.newsletter} onSubmit={handleSubmit}>
          <div className={styles.newsletterCopy}>
            <p className={styles.newsletterTitle}>Stay in the Circle</p>
            <p className={styles.newsletterDesc}>Occasional journeys, destination notes and ideas worth travelling for.</p>
          </div>
          <div className={styles.newsletterForm}>
            <label className="visually-hidden" htmlFor={emailId}>
              Email address
            </label>
            <input className={styles.emailInput} id={emailId} placeholder="Your email address" required type="email" />
            <ActionButton type="submit" variant="tertiary" className={styles.newsletterSubmit}>
              Join the Circle
            </ActionButton>
          </div>
          <p aria-live="polite" className={styles.confirmation} role="status">
            {status === "submitted" ? "Thank you — you're in the circle." : ""}
          </p>
        </form>
      </Container>
    </section>
  );
}
