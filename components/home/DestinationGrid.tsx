import { getHomepageDestinations } from "@/lib/site-data";
import DestinationGridClient from "./DestinationGridClient";

export default async function DestinationGrid({
  heading,
  subheading,
}: {
  heading: string | null;
  subheading: string | null;
}) {
  const destinations = await getHomepageDestinations();

  return (
    <DestinationGridClient
      destinations={destinations}
      heading={heading?.trim() || "Where your circle begins"}
      subheading={subheading?.trim() || "From the palaces of Rajasthan to the temples of Kyoto — every destination is chosen for what it teaches, not just what it photographs."}
    />
  );
}
