import { getHomepageWhyUs } from "@/lib/site-data";
import WhyMYCClient from "./WhyMYCClient";

export default async function WhyMYC({ heading, subheading }: { heading?: string | null; subheading?: string | null }) {
  const principles = await getHomepageWhyUs();
  return <WhyMYCClient heading={heading} subheading={subheading} principles={principles} />;
}
