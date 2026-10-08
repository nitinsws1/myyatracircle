import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { HOME_SECTIONS, HOME_SECTION_KEYS } from "@/lib/content-config";

// cache() = if several components ask for the same thing during one page render, the database is hit once

export const getSiteSettings = cache(getSettings);

// Items for the header menus (published content only)
export const getNav = cache(async () => {
  const [destinations, packages] = await Promise.all([
    prisma.destination.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 8,
      select: { name: true, slug: true },
    }),
    prisma.tourPackage.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: 6,
      select: { name: true, slug: true },
    }),
  ]);
  return { destinations, packages };
});

// CMS pages that are switched on (About, Privacy, Terms ...)
export const getActivePages = cache(async () => {
  const pages = await prisma.page.findMany({ where: { isActive: true }, select: { slug: true, title: true } });
  return new Map(pages.map((p) => [p.slug, p.title]));
});

export const getSocialLinks = cache(() =>
  prisma.socialLink.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, platform: true, url: true } })
);

export const getHeroSlides = cache(() =>
  prisma.heroBanner.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, mediaUrl: true, mediaType: true, heading: true, subHeading: true, ctaText: true, ctaUrl: true },
  })
);

// The homepage sections the admin switched on, in the order the admin chose.
// If the admin never opened the homepage manager, we fall back to the default order.
export const getHomeSections = cache(async () => {
  const all = await prisma.homepageSection.count();
  if (all === 0) {
    return HOME_SECTION_KEYS.map((key) => ({ key, title: HOME_SECTIONS[key].defaultTitle, subtitle: null as string | null }));
  }
  const rows = await prisma.homepageSection.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
    select: { key: true, title: true, subtitle: true },
  });
  return rows.filter((r) => HOME_SECTION_KEYS.includes(r.key));
});
