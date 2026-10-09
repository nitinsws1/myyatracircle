import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import BlogCard from "@/components/home/BlogCard";
import { blogs } from "@/lib/data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Journal | My Yatra Circle",
  description: "Places to know, stories to savour, and ideas for journeys worth taking.",
};

export default function BlogsPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Journal"
        title="Stories worth travelling for."
        desc="Places to know, stories to savour, and ideas for journeys worth taking."
      />

      <section className={styles.section}>
        <Container className={styles.grid}>
          {blogs.map((blog) => (
            <BlogCard key={blog.slug} blog={blog} sizes="(max-width: 1023px) 46vw, 23vw" />
          ))}
        </Container>
      </section>
    </main>
  );
}
