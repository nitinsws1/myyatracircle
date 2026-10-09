import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailHero from "@/components/ui/DetailHero";
import { blogs } from "@/lib/data";

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = blogs.find((item) => item.slug === slug);
  if (!blog) return {};
  return {
    title: `${blog.title} | My Yatra Circle`,
    description: blog.summary,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = blogs.find((item) => item.slug === slug);
  if (!blog) notFound();

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
