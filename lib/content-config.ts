// ---- pages whose heading, banner and SEO the admin can edit ----
export const PUBLIC_PAGES = [
  { slug: "destinations", label: "Destinations", path: "/destinations", defaultTitle: "Explore Destinations" },
  { slug: "packages", label: "Tour Packages", path: "/packages", defaultTitle: "Tour Packages" },
  { slug: "experiences", label: "Experiences", path: "/experiences", defaultTitle: "Travel Experiences" },
  { slug: "blogs", label: "Blogs", path: "/blogs", defaultTitle: "Travel Blog" },
  { slug: "testimonials", label: "Testimonials", path: "/testimonials", defaultTitle: "What Our Travelers Say" },
  { slug: "faqs", label: "FAQs", path: "/faqs", defaultTitle: "Frequently Asked Questions" },
  { slug: "contact", label: "Contact Us", path: "/contact-us", defaultTitle: "Contact Us" },
  { slug: "customized-holidays", label: "Customized Holidays", path: "/customized-holidays", defaultTitle: "Plan Your Own Holiday" },
] as const;

// Saved as plain settings: page.<slug>.title, page.<slug>.banner, and so on
export const PAGE_META_FIELDS = ["title", "subtitle", "banner", "bannerType", "metaTitle", "metaDescription", "metaKeywords"] as const;
export type PageMetaField = (typeof PAGE_META_FIELDS)[number];
export type PageMeta = Record<PageMetaField, string>;

// ---- homepage sections (rows of HomepageSection) ----
export const HOME_SECTIONS: Record<string, { label: string; defaultTitle: string; note: string; manage: { href: string; label: string } }> = {
  hero: { label: "Hero banners", defaultTitle: "Hero", note: "The slider at the top of the homepage", manage: { href: "/admin/content/homepage?tab=hero", label: "Manage banners" } },
  featuredDestinations: { label: "Featured destinations", defaultTitle: "Featured Destinations", note: "Destinations ticked 'Show on homepage'", manage: { href: "/admin/destinations", label: "Choose destinations" } },
  featuredPackages: { label: "Featured tour packages", defaultTitle: "Featured Tour Packages", note: "Packages ticked 'Show on homepage'", manage: { href: "/admin/packages", label: "Choose packages" } },
  experiences: { label: "Travel experiences", defaultTitle: "Travel Experiences", note: "Experiences ticked 'Show on homepage'", manage: { href: "/admin/experiences", label: "Choose experiences" } },
  whyUs: { label: "Why travel with us", defaultTitle: "Why Travel With Us", note: "Active reasons, in the order you set", manage: { href: "/admin/team?tab=why", label: "Edit reasons" } },
  testimonials: { label: "Testimonials", defaultTitle: "What Our Travelers Say", note: "Approved testimonials marked as featured", manage: { href: "/admin/testimonials", label: "Choose testimonials" } },
  blogs: { label: "Latest blogs", defaultTitle: "From Our Blog", note: "Blogs ticked 'Show on homepage'", manage: { href: "/admin/blogs", label: "Choose blogs" } },
};
export const HOME_SECTION_KEYS = Object.keys(HOME_SECTIONS);

export type RowState = { ok: boolean; error?: string } | undefined;

// ---- helpers ----
// youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID  ->  the 11 character video id
export function youtubeId(input: string): string | null {
  try {
    const u = new URL(input.trim());
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else id = /^\/(embed|shorts|live)\/([^/?]+)/.exec(u.pathname)?.[2] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function timeAgo(d: Date | null | undefined) {
  if (!d) return "Not edited yet";
  const secs = (Date.now() - d.getTime()) / 1000;
  if (secs < 60) return "Just now";
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (secs >= size) return rtf.format(-Math.floor(secs / size), unit);
  }
  return "Just now";
}
