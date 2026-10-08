import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import { getActivePages, getNav, getSiteSettings } from "@/lib/site-data";
import SiteHeader, { type NavItem } from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

// One font family for headings and body text, as in the palette handoff
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const name = s.siteName || "My Yatra Circle";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: s.siteMetaTitle || name, template: `%s | ${name}` },
    description: s.siteMetaDescription || s.tagline || undefined,
    icons: s.favicon ? { icon: s.favicon } : undefined,
    openGraph: { siteName: name, type: "website" },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, nav, pages] = await Promise.all([getSiteSettings(), getNav(), getActivePages()]);
  const aboutOn = pages.has("about-us");

  const items: NavItem[] = [
    {
      label: "Destinations", href: "/destinations",
      children: nav.destinations.length
        ? [...nav.destinations.map((d) => ({ label: d.name, href: `/destinations/${d.slug}` })), { label: "View all destinations", href: "/destinations" }]
        : undefined,
    },
    {
      label: "Journeys", href: "/packages",
      children: nav.packages.length
        ? [...nav.packages.map((p) => ({ label: p.name, href: `/packages/${p.slug}` })), { label: "View all journeys", href: "/packages" }]
        : undefined,
    },
    { label: "Experiences", href: "/experiences" },
    { label: "Inspiration", href: "/blogs" },
    {
      label: "About", href: aboutOn ? "/about-us" : "/contact-us",
      children: [
        ...(aboutOn ? [{ label: "Our story", href: "/about-us" }] : []),
        { label: "Traveller stories", href: "/testimonials" },
        { label: "FAQs", href: "/faqs" },
        { label: "Contact", href: "/contact-us" },
      ],
    },
  ];

  return (
    <div className={`${poppins.className} min-h-screen bg-ivory text-ink antialiased`}>
      <SiteHeader siteName={s.siteName || "My Yatra Circle"} logo={s.logo} items={items} />
      <main>{children}</main>
      <SiteFooter />

      {/* Google Analytics: only the validated Measurement ID is ever used here */}
      {s.gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.gaId}');`}
          </Script>
        </>
      )}
    </div>
  );
}
