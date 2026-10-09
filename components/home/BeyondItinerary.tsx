import { getHomepageExperiences } from "@/lib/site-data";
import BeyondItineraryClient from "./BeyondItineraryClient";

export default async function BeyondItinerary({
  heading,
  subheading,
}: {
  heading: string | null;
  subheading: string | null;
}) {
  const experiences = await getHomepageExperiences();
  if (experiences.length === 0) return null;

  return <BeyondItineraryClient experiences={experiences} heading={heading} subheading={subheading} />;
}
