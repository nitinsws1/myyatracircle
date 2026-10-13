import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import BlogCard from "@/components/home/BlogCard";
// import WhyMYC from "@/components/home/WhyMYC";
import { getAllBlogs, getPageSettings } from "@/lib/site-data";
import styles from "./page.module.css";

// Defaults are used whenever the matching SiteSetting row is missing, NULL or empty.
const DEFAULT_TITLE = "Stories worth travelling for.";
const DEFAULT_SUBTITLE = "Places to know, stories to savour, and ideas for journeys worth taking.";
const DEFAULT_META_TITLE = "Journal | My Yatra Circle";

// SiteSetting keys used: page.blogs.title / subtitle / banner / bannerType /
// metaTitle / metaDescription / metaKeywords
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPageSettings("blogs");

  return {
    title: settings.metaTitle ?? DEFAULT_META_TITLE,
    description: settings.metaDescription ?? settings.subtitle ?? DEFAULT_SUBTITLE,
    keywords: settings.metaKeywords ?? undefined,
  };
}

export default async function BlogsPage() {
  const [blogs, settings] = await Promise.all([getAllBlogs(), getPageSettings("blogs")]);

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Journal"
        title={settings.title ?? DEFAULT_TITLE}
        desc={settings.subtitle ?? DEFAULT_SUBTITLE}
        banner={settings.banner}
        bannerType={settings.bannerType}
      />

      <section className={styles.section}>
        {blogs.length > 0 && (
          <Container width="editorial" className={styles.intro}>
            <div className={styles.introCopy}>
              <p className={styles.introEyebrow}>Notes from near and far</p>
              <h2 className={styles.introTitle}>A little inspiration for the road</h2>
              <p className={styles.introText}>
                Thoughtful guides, local flavours, and the details that make a journey stay with you.
              </p>
            </div>
            <div className={styles.count} aria-label={`${blogs.length} published stories`}>
              <span className={styles.countNumber}>{String(blogs.length).padStart(2, "0")}</span>
              <span className={styles.countLabel}>{blogs.length === 1 ? "story" : "stories"}<br />to discover</span>
            </div>
          </Container>
        )}

        <Container width="editorial" className={styles.grid}>
          {blogs.map((blog) => (
            <BlogCard
              key={blog.slug}
              variant="catalog"
              sizes="(max-width: 600px) 100vw, (max-width: 1023px) 50vw, 33vw"
              blog={{
                slug: blog.slug,
                category: blog.category,
                date: blog.date,
                title: blog.title,
                summary: blog.summary || blog.title,
                image: blog.image ?? "/images/about-kerala.jpg", // blogs without a featured image still show
                alt: blog.alt,
              }}
            />
          ))}
        </Container>

        {blogs.length === 0 && (
          <Container>
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No stories published yet</p>
              <p className={styles.emptyText}>Fresh travel stories are on their way. Please check back soon.</p>
            </div>
          </Container>
        )}
      </section>
    </main>
  );
}