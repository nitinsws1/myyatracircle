import { getHomeSections } from "@/lib/site-data";
import HeroSection from "@/components/site/sections/HeroSection";

// The homepage is built from the sections the admin switched on, in the admin's order
// (Pages & Content > Homepage). Each next step adds one more case to this switch.
export default async function HomePage() {
  const sections = await getHomeSections();

  return (
    <>
      {sections.map((s) => {
        switch (s.key) {
          case "hero":
            return <HeroSection key={s.key} />;
          // case "featuredPackages": return <JourneysSection key={s.key} title={s.title} subtitle={s.subtitle} />;  (next step)
          default:
            return null;
        }
      })}
    </>
  );
}
