"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import styles from "./PhotoCardGrid.module.css";

export type PhotoCardItem = {
  slug: string;
  name: string;
  image: string | null;
  alt?: string | null;
  /** Shown on hover, clamped to 2 lines. */
  description?: string | null;
  /** Optional. When 2+ different groups exist, filter chips are shown. */
  group?: string | null;
};

type Props = {
  items: PhotoCardItem[];
  /** e.g. "/destinations" -> links to /destinations/<slug> */
  hrefBase: string;
  /** e.g. { one: "destination", many: "destinations" } */
  noun: { one: string; many: string };
};

const EASE = [0.22, 1, 0.36, 1] as const;
const ALL = "All";

function Card({ item, hrefBase, index }: { item: PhotoCardItem; hrefBase: string; index: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : (index % 3) * 0.08 }}
    >
      <Link href={`${hrefBase}/${item.slug}`} className={styles.card}>
        <span className={styles.media}>
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.img} src={item.image} alt={item.alt || item.name} loading="lazy" draggable={false} />
          ) : (
            <span className={styles.fallback} aria-hidden="true">
              {item.name.charAt(0)}
            </span>
          )}
        </span>

        <span className={styles.shade} aria-hidden="true" />

        <span className={styles.body}>
          <span className={styles.text}>
            <span className={styles.name}>{item.name}</span>
            {item.description ? (
              <span className={styles.descWrap}>
                <span className={styles.desc}>{item.description}</span>
              </span>
            ) : null}
          </span>

          <span className={styles.arrow} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </Link>
    </motion.li>
  );
}

export default function PhotoCardGrid({ items, hrefBase, noun }: Props) {
  const [filter, setFilter] = useState<string>(ALL);

  const groups = useMemo(
    () => Array.from(new Set(items.map((i) => i.group).filter((g): g is string => !!g))),
    [items]
  );
  const filters = groups.length > 1 ? [ALL, ...groups] : [];

  const visible = useMemo(
    () => (filter === ALL ? items : items.filter((i) => i.group === filter)),
    [items, filter]
  );

  return (
    <LayoutGroup id={hrefBase}>
      <div className={styles.intro}>
        <span className={styles.count} aria-live="polite">
          {visible.length} {visible.length === 1 ? noun.one : noun.many}
        </span>

        <span className={styles.rule} aria-hidden="true" />

        {filters.length > 0 && (
          <div className={styles.filters} role="group" aria-label={`Filter ${noun.many}`}>
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                className={styles.chip}
                data-active={filter === f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {filter === f && (
                  <motion.span
                    layoutId="chip-pill"
                    className={styles.chipPill}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className={styles.chipLabel}>{f}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <ul className={styles.grid}>
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item, i) => (
            <Card key={item.slug} item={item} hrefBase={hrefBase} index={i} />
          ))}
        </AnimatePresence>
      </ul>
    </LayoutGroup>
  );
}
