import HeroSlider from "@/components/site/HeroSlider";
import { getHeroSlides, getSiteSettings } from "@/lib/site-data";
import HeroFallback from "./HeroFallback";

export default async function Hero() {
  const [slides, settings] = await Promise.all([getHeroSlides(), getSiteSettings()]);

  if (slides.length === 0) {
    return <HeroFallback />;
  }

  return (
    <HeroSlider
      slides={slides}
      eyebrow={settings.tagline}
      fallbackTitle={settings.siteName || "My Yatra Circle"}
      homeStyle
    />
  );
}
