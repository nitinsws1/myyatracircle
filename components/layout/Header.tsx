import HeaderClient from "@/components/layout/HeaderClient";
import { getDestinations, getPackages, getSiteSettings } from "@/lib/site-data";

export default async function Header() {
  const [destinations, packages, settings] = await Promise.all([
    getDestinations(),
    getPackages(),
    getSiteSettings(),
  ]);

  return (
    <HeaderClient
      destinations={destinations}
      packages={packages}
      logo={settings.logo.trim()}
      siteName={settings.siteName.trim()}
    />
  );
}
