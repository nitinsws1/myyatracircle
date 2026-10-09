import Image from "next/image";
import Link from "next/link";
import type { Blog } from "@/lib/data";
import styles from "./BlogCard.module.css";

type Variant = "default" | "hero" | "horizontal" | "text" | "row";

const variantClass: Record<Variant, string> = {
  default: "",
  hero: styles.cardHero,
  horizontal: styles.cardHorizontal,
  text: styles.cardText,
  row: styles.cardRow,
};

type Props = {
  blog: Blog;
  variant?: Variant;
  /** Extra class applied alongside the variant, e.g. row position (rowLead / rowSupportA / rowSupportB). */
  className?: string;
  sizes?: string;
};

export default function BlogCard({ blog, variant = "default", className, sizes }: Props) {
  const cardClass = [styles.card, variantClass[variant], className].filter(Boolean).join(" ");
  const showMedia = variant !== "text";

  return (
    <article className={cardClass}>
      {showMedia && (
        <Link
          aria-label={`Read article: ${blog.title}`}
          className={`${styles.mediaLink} photo-hover`}
          href={`/blogs/${blog.slug}`}
        >
          <div className={styles.media}>
            <Image
              alt={blog.alt}
              src={blog.image}
              fill
              sizes={sizes ?? "(max-width: 767px) 92vw, (max-width: 1279px) 90vw, 34vw"}
              className={`${styles.image} photo-hover-img`}
            />
          </div>
        </Link>
      )}
      <div className={styles.body}>
        <p className={styles.eyebrow}>
          <span className={styles.category}>{blog.category}</span>
          {blog.destination && <span className={styles.destination}>{blog.destination}</span>}
        </p>
        <h3 className={styles.title}>{blog.title}</h3>
        <p className={styles.summary}>{blog.summary}</p>
        <Link className={styles.link} href={`/blogs/${blog.slug}`}>
          Read the Story
          <span aria-hidden="true" className="cta-arrow">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
