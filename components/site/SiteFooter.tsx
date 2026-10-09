import Link from "next/link";
import { platformLabel } from "@/lib/settings-config";
import { getActivePages, getNav, getSiteSettings, getSocialLinks } from "@/lib/site-data";
import { Container } from "@/components/site/ui";

const LEGAL = ["privacy-policy", "terms-and-conditions", "cancellation-policy", "disclaimer", "sitemap"];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-white/70">{children}</ul>
    </div>
  );
}
const FLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li><Link href={href} className="transition-colors hover:text-gold-light">{children}</Link></li>
);

export default async function SiteFooter() {
  const [s, nav, pages, social] = await Promise.all([getSiteSettings(), getNav(), getActivePages(), getSocialLinks()]);
  const name = s.siteName || "My Yatra Circle";
  const year = new Date().getFullYear();
  const copyright = (s.copyrightText || `© {year} ${name}. All rights reserved.`).replace("{year}", String(year));
  const legal = LEGAL.filter((slug) => pages.has(slug));

  return (
    <footer className="bg-footer text-white">
      <Container className="pb-8 pt-20">
        <p className="max-w-2xl text-sm font-medium text-white/60">
          {s.footerText || `${name} — ${s.tagline || "Curated journeys. Thoughtfully made."}`}
        </p>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <Column title="Destinations">
            {nav.destinations.slice(0, 6).map((d) => <FLink key={d.slug} href={`/destinations/${d.slug}`}>{d.name}</FLink>)}
            <FLink href="/destinations">All destinations</FLink>
          </Column>

          <Column title="Journeys">
            <FLink href="/packages">All journeys</FLink>
            <FLink href="/customized-holidays">Plan a journey</FLink>
          </Column>

          <Column title="Explore">
            <FLink href="/experiences">Experiences</FLink>
            <FLink href="/blogs">Journal</FLink>
            <FLink href="/testimonials">Traveller stories</FLink>
            <FLink href="/faqs">FAQs</FLink>
          </Column>

          <Column title="About">
            {pages.has("about-us") && <FLink href="/about-us">Our story</FLink>}
            <FLink href="/contact-us">Contact</FLink>
          </Column>

          <Column title="Contact">
            {s.email && <li><a href={`mailto:${s.email}`} className="transition-colors hover:text-gold-light">{s.email}</a></li>}
            {s.phone && <li><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-gold-light">{s.phone}</a></li>}
            {s.address && <li className="whitespace-pre-line leading-relaxed">{s.address}</li>}
            {s.workingHours && <li className="text-white/50">{s.workingHours}</li>}
            {social.length > 0 && (
              <li className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                {social.map((l) => (
                  <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="text-white/60 transition-colors hover:text-gold-light">
                    {platformLabel(l.platform)}
                  </a>
                ))}
              </li>
            )}
          </Column>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-[13px] text-white/60">
          <p>{copyright}</p>
          {legal.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legal.map((slug) => (
                <li key={slug}><Link href={`/${slug}`} className="transition-colors hover:text-gold-light">{pages.get(slug)}</Link></li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </footer>
  );
}
