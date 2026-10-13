import "server-only";
import { cache } from "react";
import { cleanHtml, stripHtml } from "@/lib/html";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { HOME_SECTIONS, HOME_SECTION_KEYS } from "@/lib/content-config";
import type { Blog as HomeBlog, BeyondItem, Package as HomePackage } from "@/lib/data";
import { fmtBlogDate } from "@/lib/blog-config";

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

export const isInternational = (destination: { name: string; region: string | null }) =>
  !/\bindia\b/i.test(`${destination.name} ${destination.region ?? ""}`);

export const getDestinations = cache(async () => {
  const rows = await prisma.destination.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { featuredOrder: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      slug: true,
      region: true,
      shortDescription: true,
      thumbnailImage: true,
      bannerImage: true,
      bannerType: true,
    },
  });

  return rows.map((destination) => ({
    name: destination.name,
    slug: destination.slug,
    region: isInternational(destination) ? "international" as const : "india" as const,
    image: destination.thumbnailImage ?? (destination.bannerType === "IMAGE" ? destination.bannerImage : null),
    alt: destination.name,
    tag: destination.shortDescription ?? "",
  }));
});

export const getDestinationBySlug = cache((slug: string) =>
  prisma.destination.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      region: true,
      state: true,
      shortDescription: true,
      overview: true,
      bannerImage: true,
      bannerType: true,
      thumbnailImage: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      gallery: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: { id: true, url: true, type: true },
      },
      places: {
        where: { status: "PUBLISHED" },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          about: true,
          heroImage: true,
          heroType: true,
          thumbnailImage: true,
          gallery: {
            orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
            select: { id: true, url: true, type: true },
          },
        },
      },
      // Card-level data only: the itinerary / inclusions belong on the package detail page.
      packages: {
        where: { package: { status: "PUBLISHED" } },
        select: {
          package: {
            select: {
              id: true,
              name: true,
              slug: true,
              isFeatured: true,
              sortOrder: true,
              durationDays: true,
              durationNights: true,
              shortDescription: true,
              heroImage: true,
              heroType: true,
              thumbnailImage: true,
              highlights: {
                orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
                take: 3,
                select: { id: true, text: true },
              },
              gallery: {
                orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
                select: { id: true, url: true, type: true },
              },
            },
          },
        },
      },
      experiences: {
        where: { experience: { status: "PUBLISHED" } },
        select: {
          experience: {
            select: {
              id: true,
              name: true,
              slug: true,
              sortOrder: true,
              shortDescription: true,
              overview: true,
              heroImage: true,
              heroType: true,
              thumbnailImage: true,
              highlights: {
                orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
                take: 3,
                select: { id: true, text: true },
              },
              gallery: {
                orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
                select: { id: true, url: true, type: true },
              },
            },
          },
        },
      },
    },
  })
);

export const getHomepageDestinations = cache(async () => {
  const rows = await prisma.destination.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: [{ featuredOrder: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      slug: true,
      thumbnailImage: true,
      bannerImage: true,
      bannerType: true,
    },
  });

  return rows.flatMap((destination) => {
    const image = destination.thumbnailImage ?? (destination.bannerType === "IMAGE" ? destination.bannerImage : null);
    return image
      ? [{
          name: stripHtml(destination.name),
          slug: destination.slug,
          image,
          alt: stripHtml(destination.name),
        }]
      : [];
  });
});

// CMS pages that are switched on (About, Privacy, Terms ...)
export const getActivePages = cache(async () => {
  const pages = await prisma.page.findMany({ where: { isActive: true }, select: { slug: true, title: true } });
  return new Map(pages.map((p) => [p.slug, p.title]));
});

export const getSocialLinks = cache(() =>
  prisma.socialLink.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, platform: true, url: true },
  })
);

export const getHeroSlides = cache(() =>
  prisma.heroBanner.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, mediaUrl: true, mediaType: true, heading: true, subHeading: true, ctaText: true, ctaUrl: true },
  })
);

export const getFeaturedTestimonials = cache(() =>
  prisma.testimonial
    .findMany({
      where: { isApproved: true, isFeatured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
      select: { 
        id: true, 
        travelerName: true, 
        location: true, 
        feedback: true,
        imageUrl: true // Added imageUrl here
      },
    })
    .then((rows) =>
      rows.map((testimonial) => ({
        id: testimonial.id,
        travelerName: stripHtml(testimonial.travelerName),
        location: testimonial.location ? stripHtml(testimonial.location) : null,
        feedbackHtml: cleanHtml(testimonial.feedback),
        imageUrl: testimonial.imageUrl // Passed it to the frontend
      })),
    )
);

export const getHomepageExperiences = cache(async (): Promise<BeyondItem[]> => {
  const rows = await prisma.experience.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: [{ featuredOrder: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
    take: 4,
    select: {
      name: true,
      slug: true,
      shortDescription: true,
      overview: true,
      thumbnailImage: true,
      heroImage: true,
      heroType: true,
      destinations: {
        where: { destination: { status: "PUBLISHED" } },
        select: { destination: { select: { name: true } } },
      },
      highlights: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        take: 1,
        select: { text: true },
      },
    },
  });

  return rows.flatMap((experience) => {
    const image = experience.thumbnailImage ?? (experience.heroType === "IMAGE" ? experience.heroImage : null);
    if (!image) return [];
    const title = stripHtml(experience.name);
    const destinations = experience.destinations.map((item) => stripHtml(item.destination.name));
    return [{
      slug: experience.slug,
      eyebrow: destinations.join(" · ") || "Featured Experience",
      title,
      desc: stripHtml(experience.shortDescription ?? experience.highlights[0]?.text ?? experience.overview) || title,
      linkLabel: `Explore ${title}`,
      image,
      alt: title,
    }];
  });
});

export const getHomepageBlogs = cache(async (): Promise<HomeBlog[]> => {
  const now = new Date();
  const rows = await prisma.blog.findMany({
    where: {
      status: "PUBLISHED",
      isFeatured: true,
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
    take: 8,
    select: {
      title: true,
      slug: true,
      shortDescription: true,
      featuredImage: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
  });

  return rows.flatMap((blog) =>
    blog.featuredImage
      ? [{
          slug: blog.slug,
          category: blog.category ? stripHtml(blog.category.name) : "Journal",
          date: blog.publishedAt ? fmtBlogDate(blog.publishedAt) : "",
          title: stripHtml(blog.title),
          summary: stripHtml(blog.shortDescription) || stripHtml(blog.title),
          image: blog.featuredImage,
          alt: stripHtml(blog.title),
        }]
      : [],
  ).slice(0, 4);
});

export const getHomepageWhyUs = cache(async () => {
  const rows = await prisma.whyUsItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, title: true, description: true },
  });

  return rows.map((item) => ({
    id: item.id,
    category: stripHtml(item.title),
    heading: stripHtml(item.title),
    body: stripHtml(item.description) || stripHtml(item.title),
  }));
});

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

// ───────── About page ─────────
export const getAboutPage = cache(async () => {
  const [page, whyUs, settingRows] = await Promise.all([
    prisma.page.findUnique({
      where: { slug: "about-us" },
      select: {
        title: true,
        isActive: true,
        metaTitle: true,
        metaDescription: true,
        sections: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          select: { id: true, sectionKey: true, title: true, content: true, imageUrl: true },
        },
      },
    }),
    prisma.whyUsItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, title: true, description: true },
    }),
    prisma.siteSetting.findMany({
      where: { key: { in: ["aboutHeroImage", "aboutHeroEyebrow"] } },
      select: { key: true, value: true },
    }),
  ]);

  if (!page || !page.isActive) return null;

  const setting = (key: string) => settingRows.find((r) => r.key === key)?.value?.trim() || null;

  // every PageSection of the About page, in the admin's order
  const sections = page.sections
    .map((s) => ({
      id: s.id,
      key: s.sectionKey,
      label: stripHtml(s.title) || null,
      imageUrl: s.imageUrl,
      html: cleanHtml(s.content),
    }))
    .filter((s) => s.label || s.imageUrl || stripHtml(s.html));

  return {
    metaTitle: page.metaTitle ?? page.title,
    metaDescription: page.metaDescription ?? undefined,
    hero: {
      eyebrow: setting("aboutHeroEyebrow") ?? "About MYC",
      title: page.title,
      imageUrl: setting("aboutHeroImage") ?? "/images/about-kerala.jpg",
    },
    sections,
    features: whyUs.map((w, i) => ({
      id: w.id,
      index: String(i + 1).padStart(2, "0"),
      label: stripHtml(w.title).replace(/[\s:：.\-–—]+$/, ""), // removes a trailing ":" etc.
      description: stripHtml(w.description) || null,
    })),
  };
});

export const getAboutTeamMembers = cache(async () => {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { name: true, designation: true, bio: true, photoUrl: true },
  });

  return members.map((member) => ({
    name: stripHtml(member.name),
    designation: member.designation ? stripHtml(member.designation) : null,
    bio: member.bio ? stripHtml(member.bio) : null,
    photoUrl: member.photoUrl,
  }));
});

// ───────── Tour packages (homepage explorer, package cards) ─────────
export type PackageItem = {
  id: number;
  slug: string;
  title: string;
  region: "india" | "international";
  nightsCount: number; // 0 = not set in the DB
  duration: string; // "5D / 4N", same format as the admin panel
  destinations: string; // "Rajasthan, India"
  summary: string;
  image: string;
  isFeatured: boolean;
};

export const getPackages = cache(async (): Promise<PackageItem[]> => {
  const rows = await prisma.tourPackage.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { featuredOrder: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      durationDays: true,
      durationNights: true,
      shortDescription: true,
      heroImage: true,
      heroType: true,
      thumbnailImage: true,
      isFeatured: true,
      destinations: {
        where: { destination: { status: "PUBLISHED" } },
        select: { destination: { select: { name: true, region: true } } },
      },
    },
  });

  return rows.map((p) => {
    const dests = p.destinations.map((x) => x.destination);
    const days = p.durationDays;
    const nights = p.durationNights ?? (days ? Math.max(days - 1, 0) : 0);

    return {
      id: p.id,
      slug: p.slug,
      title: stripHtml(p.name),
      region: dests.some((destination) => !isInternational(destination)) ? "india" : "international",
      nightsCount: nights,
      duration: days && p.durationNights != null ? `${days}D / ${p.durationNights}N` : days ? `${days}D` : nights ? `${nights}N` : "",
      destinations: dests.map((d) => stripHtml(d.name)).join(", "),
      summary: stripHtml(p.shortDescription),
      image: p.thumbnailImage ?? (p.heroType === "IMAGE" ? p.heroImage : null) ?? "",
      isFeatured: p.isFeatured,
    };
  });
});

export const getHomepagePackages = cache(async (): Promise<HomePackage[]> => {
  const rows = await getPackages();
  return rows
    .filter((item) => item.isFeatured && item.image)
    .slice(0, 4)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      typeTag: "Tour Package",
      place: item.destinations || "Featured journey",
      nights: item.nightsCount ? `${item.nightsCount} Nights` : item.duration,
      nightsCount: item.nightsCount,
      region: item.region,
      desc: item.summary,
      image: item.image,
      alt: item.title,
    }));
});

// ───────── Package detail ─────────
export const getPackageBySlug = cache(async (slug: string) => {
  const row = await prisma.tourPackage.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      durationDays: true,
      durationNights: true,
      shortDescription: true,
      overview: true,
      heroImage: true,
      heroType: true,
      thumbnailImage: true,
      isFeatured: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      destinations: {
        select: { destination: { select: { name: true, slug: true, region: true } } },
      },
      itinerary: { orderBy: { dayNumber: "asc" }, select: { id: true, dayNumber: true, title: true, description: true } },
      highlights: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, text: true } },
      inclusions: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: { id: true, kind: true, text: true },
      },
      gallery: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, url: true, type: true } },
    },
  });
  return row;
});

// ───────── Page settings (SiteSetting rows named "page.<page>.<field>") ─────────
// Example: page.experiences.title, page.experiences.subtitle, page.experiences.metaTitle ...
// Returns a plain object like { title, subtitle, banner, bannerType, metaTitle, metaDescription, metaKeywords }.
// Empty / NULL values come back as null so the page can fall back to its defaults.
export type PageSettings = {
  title: string | null;
  subtitle: string | null;
  banner: string | null;
  bannerType: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
};

export const getPageSettings = cache(async (page: string): Promise<PageSettings> => {
  const prefix = `page.${page}.`;
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: prefix } },
    select: { key: true, value: true },
  });

  const get = (field: string) => rows.find((r) => r.key === prefix + field)?.value?.trim() || null;

  return {
    title: get("title"),
    subtitle: get("subtitle"),
    banner: get("banner"),
    bannerType: get("bannerType"),
    metaTitle: get("metaTitle"),
    metaDescription: get("metaDescription"),
    metaKeywords: get("metaKeywords"),
  };
});

// ───────── Experiences (listing) ─────────
export const getExperiences = cache(async () => {
  const rows = await prisma.experience.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { featuredOrder: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      overview: true,
      thumbnailImage: true,
      heroImage: true,
      heroType: true,
      destinations: {
        where: { destination: { status: "PUBLISHED" } },
        select: { destination: { select: { name: true } } },
      },
    },
  });

  return rows.map((e) => ({
    id: e.id,
    slug: e.slug,
    name: stripHtml(e.name),
    image: e.thumbnailImage ?? (e.heroType === "IMAGE" ? e.heroImage : null),
    eyebrow: e.destinations.map((d) => stripHtml(d.destination.name)).join(" · ") || "Experience",
    summary: stripHtml(e.shortDescription ?? e.overview ?? ""),
  }));
});

// ───────── Experience detail ─────────
export const getExperienceBySlug = cache(async (slug: string) => {
  const row = await prisma.experience.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      overview: true,
      heroImage: true,
      heroType: true,
      thumbnailImage: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      highlights: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, text: true } },
      gallery: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, url: true, type: true } },
      destinations: {
        where: { destination: { status: "PUBLISHED" } },
        select: { destination: { select: { name: true, slug: true } } },
      },
    },
  });
  if (!row) return null;
  return {
    ...row,
    name: stripHtml(row.name),
    overviewHtml: cleanHtml(row.overview),
    summary: stripHtml(row.shortDescription ?? row.overview ?? ""),
    destinationNames: row.destinations.map((d) => stripHtml(d.destination.name)),
  };
});

// ───────── Blog listing ─────────
export const getAllBlogs = cache(async () => {
  const now = new Date();
  const rows = await prisma.blog.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      featuredImage: true,
      publishedAt: true,
      authorName: true,
      category: { select: { name: true } },
    },
  });

  return rows.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: stripHtml(b.title),
    category: b.category ? stripHtml(b.category.name) : "Journal",
    date: b.publishedAt ? fmtBlogDate(b.publishedAt) : "",
    summary: stripHtml(b.shortDescription ?? ""),
    image: b.featuredImage,
    alt: stripHtml(b.title),
  }));
});

// ───────── Blog detail ─────────
export const getBlogBySlug = cache(async (slug: string) => {
  const now = new Date();
  const row = await prisma.blog.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      authorName: true,
      shortDescription: true,
      content: true,
      featuredImage: true,
      publishedAt: true,
      status: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      category: { select: { name: true, slug: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!row || row.status !== "PUBLISHED") return null;
  if (row.publishedAt && row.publishedAt > now) return null; // scheduled

  return {
    ...row,
    title: stripHtml(row.title),
    category: row.category ? stripHtml(row.category.name) : "Journal",
    date: row.publishedAt ? fmtBlogDate(row.publishedAt) : "",
    summary: stripHtml(row.shortDescription ?? ""),
    contentHtml: cleanHtml(row.content),
  };
});

// ───────── FAQs ─────────
export const getFaqs = cache(() =>
  prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, question: true, answer: true },
  }),
);

// ───────── All testimonials (public testimonials page) ─────────
export const getAllTestimonials = cache(() =>
  prisma.testimonial
    .findMany({
      where: { isApproved: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, travelerName: true, location: true, feedback: true, imageUrl: true },
    })
    .then((rows) =>
      rows.map((t) => ({
        id: t.id,
        travelerName: stripHtml(t.travelerName),
        location: t.location ? stripHtml(t.location) : null,
        feedbackHtml: cleanHtml(t.feedback),
        imageUrl: t.imageUrl ?? null,
      })),
    ),
);

// ───────── CMS page by slug (privacy, terms, etc.) ─────────
export const getPageBySlug = cache(async (slug: string) => {
  const row = await prisma.page.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      updatedAt: true,
      sections: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: { id: true, sectionKey: true, title: true, content: true, imageUrl: true },
      },
    },
  });
  if (!row) return null;
  return {
    ...row,
    contentHtml: cleanHtml(row.content),
    sections: row.sections.map((s) => ({
      id: s.id,
      key: s.sectionKey,
      title: s.title ? stripHtml(s.title) : null,
      contentHtml: cleanHtml(s.content),
      imageUrl: s.imageUrl,
    })),
  };
});