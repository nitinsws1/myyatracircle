import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getSettings } from "@/lib/settings";
import "./site.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext", "devanagari"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// Used only until the admin fills in Settings > Default SEO
const FALLBACK_TITLE = "My Yatra Circle | Bespoke Journeys Across India and Beyond";
const FALLBACK_DESCRIPTION =
  "My Yatra Circle plans bespoke travel across India and beyond — curated itineraries, trusted local partners, and concierge support from the first conversation to the journey home.";

// Title, description and favicon now come from Settings instead of being fixed in the code
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const name = s.siteName || "My Yatra Circle";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: s.siteMetaTitle || FALLBACK_TITLE, template: `%s | ${name}` },
    description: s.siteMetaDescription || FALLBACK_DESCRIPTION,
    icons: s.favicon ? { icon: s.favicon } : undefined,
    openGraph: { siteName: name, type: "website" },
  };
}

// The <html> and <body> tags stay in the backend's own app/layout.tsx.
// This wrapper gives public pages the font, the header and the footer, and nothing else.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { gaId } = await getSettings();

  return (
    <div className={`${poppins.variable} site-root`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      {children}
      <Footer />

      {/* Google Analytics: only the validated Measurement ID from Settings is ever used */}
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
    </div>
  );
}