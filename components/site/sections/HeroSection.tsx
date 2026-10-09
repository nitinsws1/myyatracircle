import { getHeroSlides, getSiteSettings } from "@/lib/site-data";
import HeroSlider from "@/components/site/HeroSlider";

// Homepage section "hero": the slider from Pages & Content > Homepage > Hero banners
export default async function HeroSection() {
  const [slides, settings] = await Promise.all([getHeroSlides(), getSiteSettings()]);
  return <HeroSlider slides={slides} eyebrow={settings.tagline} fallbackTitle={settings.siteName || "My Yatra Circle"} />;
}
