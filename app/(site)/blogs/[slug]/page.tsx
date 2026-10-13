import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import DetailHero from "@/components/ui/DetailHero";
import { blogs } from "@/lib/data";
import { getAllBlogs, getBlogBySlug } from "@/lib/site-data";
import { slugify } from "@/lib/slug";
import styles from "./page.module.css";

type PublishedBlog = NonNullable<Awaited<ReturnType<typeof getBlogBySlug>>>;
type ResolvedBlog =
  | { kind: "published"; blog: PublishedBlog; canonicalSlug: string }
  | { kind: "sample"; blog: (typeof blogs)[number]; canonicalSlug: string };

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

async function resolveBlog(slug: string): Promise<ResolvedBlog | null> {
  const publishedBlog = await getBlogBySlug(slug);
  if (publishedBlog) return { kind: "published", blog: publishedBlog, canonicalSlug: publishedBlog.slug };

  const sampleBlog = blogs.find((blog) => blog.slug === slug || slugify(blog.title) === slug);
  if (sampleBlog) return { kind: "sample", blog: sampleBlog, canonicalSlug: sampleBlog.slug };

  const titleSlugMatch = (await getAllBlogs()).find((blog) => slugify(blog.title) === slug);
  if (!titleSlugMatch) return null;

  const aliasedBlog = await getBlogBySlug(titleSlugMatch.slug);
  return aliasedBlog
    ? { kind: "published", blog: aliasedBlog, canonicalSlug: aliasedBlog.slug }
    : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveBlog(slug);
  if (!resolved) return {};

  if (resolved.kind === "sample") {
    const { blog } = resolved;
    return {
      title: `${blog.title} | My Yatra Circle`,
      description: blog.summary,
      alternates: { canonical: `/blogs/${resolved.canonicalSlug}` },
      openGraph: { type: "article", title: blog.title, description: blog.summary },
    };
  }

  const { blog } = resolved;
  const description = blog.metaDescription ?? blog.summary;
  return {
    title: blog.metaTitle ?? `${blog.title} | My Yatra Circle`,
    description,
    keywords: blog.metaKeywords?.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    alternates: { canonical: `/blogs/${resolved.canonicalSlug}` },
    openGraph: {
      type: "article",
      title: blog.title,
      description,
      images: blog.featuredImage ? [{ url: blog.featuredImage, alt: blog.title }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = await resolveBlog(slug);
  if (!resolved) notFound();
  if (slug !== resolved.canonicalSlug) redirect(`/blogs/${resolved.canonicalSlug}`);

  if (resolved.kind === "sample") {
    const { blog } = resolved;
    return (
      <DetailHero
        image={blog.image}
        alt={blog.alt}
        eyebrow={`${blog.category} · ${blog.date}`}
        title={blog.title}
        notice={`This is sample placeholder content pending the real published article — ${blog.summary}`}
        ctaLabel="Plan Your Journey"
        ctaHref="/#journey-finder"
        backLabel="Back to the journal"
        backHref="/blogs"
      />
    );
  }

  const { blog } = resolved;
  const image = blog.featuredImage || "/images/about-kerala.jpg";

  return (
    <main id="main-content">
      <section className={styles.hero}>
        <Image src={image} alt={blog.title} fill priority sizes="100vw" className={styles.heroImage} />
        <div aria-hidden="true" className={styles.heroScrim} />
        <Container className={styles.heroContent}>
          <p className={styles.eyebrow}>
            {blog.category}{blog.date ? ` · ${blog.date}` : ""}
          </p>
          <h1 className={styles.title}>{blog.title}</h1>
          {blog.summary && <p className={styles.heroSummary}>{blog.summary}</p>}
        </Container>
      </section>

      <article className={styles.article}>
        <Container width="editorial" className={styles.articleInner}>
          {blog.authorName && <p className={styles.author}>Words by {blog.authorName}</p>}
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: blog.contentHtml }} />
          <div className={styles.actions}>
            <Button href="/#journey-finder">Plan Your Journey</Button>
            <Link className={styles.back} href="/blogs">← Back to the journal</Link>
          </div>
        </Container>
      </article>
    </main>
  );
}
