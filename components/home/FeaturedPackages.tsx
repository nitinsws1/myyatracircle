import { getHomepagePackages } from "@/lib/site-data";
import FeaturedPackagesClient from "./FeaturedPackagesClient";

export default async function FeaturedPackages({
  heading,
  subheading,
}: {
  heading: string | null;
  subheading: string | null;
}) {
  const packages = await getHomepagePackages();
  if (packages.length === 0) return null;

  return <FeaturedPackagesClient packages={packages} heading={heading} subheading={subheading} />;
}
