import { getHomepageBlogs } from "@/lib/site-data";
import FeaturedBlogsClient from "./FeaturedBlogsClient";

export default async function FeaturedBlogs({
  heading,
  subheading,
}: {
  heading: string | null;
  subheading: string | null;
}) {
  const blogs = await getHomepageBlogs();
  if (blogs.length === 0) return null;

  return <FeaturedBlogsClient blogs={blogs} heading={heading} subheading={subheading} />;
}
