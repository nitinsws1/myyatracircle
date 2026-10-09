// Pages the public website expects to exist. Their URL (slug) is fixed and they cannot be deleted.
export const SYSTEM_PAGES = [
  { slug: "about-us", title: "About Us", note: "Story, vision, mission and expertise blocks" },
  { slug: "privacy-policy", title: "Privacy Policy", note: "Linked from the website footer" },
  { slug: "terms-and-conditions", title: "Terms & Conditions", note: "Linked from the website footer" },
  { slug: "cancellation-policy", title: "Cancellation Policy", note: "Linked from the website footer" },
  { slug: "disclaimer", title: "Disclaimer", note: "Linked from the website footer" },
  { slug: "sitemap", title: "Sitemap", note: "Linked from the website footer" },
] as const;

export const isSystemSlug = (slug: string) => SYSTEM_PAGES.some((p) => p.slug === slug);

// Extra content blocks, per page. Only About Us has them. The key is saved in the database.
export const PAGE_SECTIONS: Record<string, { key: string; label: string; hint: string }[]> = {
  "about-us": [
    { key: "brandStory", label: "Brand story", hint: "How the company started and what it stands for." },
    { key: "vision", label: "Vision", hint: "Where the company wants to go." },
    { key: "mission", label: "Mission", hint: "What the company does every day to get there." },
    { key: "expertise", label: "Travel expertise", hint: "Experience, destinations covered, certifications." },
  ],
};

// A custom page must not take a URL that the website already uses for something else
export const RESERVED_SLUGS = [
  "admin", "api", "login", "search", "destinations", "destination", "places", "packages", "tour-packages",
  "experiences", "blogs", "blog", "faq", "faqs", "testimonials", "contact", "contact-us",
  "customized-holidays", "customized-holiday", "robots.txt", "sitemap.xml",
];
