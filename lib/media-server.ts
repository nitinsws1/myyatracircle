import "server-only";
import { prisma } from "@/lib/prisma";
import type { MediaKind } from "@/lib/media-config";

const insensitive = "insensitive" as const;

// Search by name, alt text or an exact tag. Same rules for the library page and the picker.
export function mediaWhere(q: string | undefined, kinds: MediaKind[]) {
  return {
    ...(kinds.length ? { kind: { in: kinds } } : {}),
    ...(q
      ? { OR: [
          { name: { contains: q, mode: insensitive } },
          { altText: { contains: q, mode: insensitive } },
          { tags: { has: q.toLowerCase() } },
        ] }
      : {}),
  };
}

export type Usage = { label: string; href?: string };

// Where is this file used on the site? (the library blocks deleting files that are in use)
export async function findUsage(url: string): Promise<Usage[]> {
  const [dest, destM, place, placeM, pkg, pkgM, exp, expM, blog, testi, member, banner, section, setting] = await Promise.all([
    prisma.destination.findMany({ where: { OR: [{ bannerImage: url }, { thumbnailImage: url }] }, select: { id: true, name: true } }),
    prisma.destinationMedia.findMany({ where: { url }, select: { destination: { select: { id: true, name: true } } } }),
    prisma.place.findMany({ where: { OR: [{ heroImage: url }, { thumbnailImage: url }] }, select: { id: true, name: true, destinationId: true } }),
    prisma.placeMedia.findMany({ where: { url }, select: { place: { select: { id: true, name: true, destinationId: true } } } }),
    prisma.tourPackage.findMany({ where: { OR: [{ heroImage: url }, { thumbnailImage: url }] }, select: { id: true, name: true } }),
    prisma.packageMedia.findMany({ where: { url }, select: { package: { select: { id: true, name: true } } } }),
    prisma.experience.findMany({ where: { OR: [{ heroImage: url }, { thumbnailImage: url }] }, select: { id: true, name: true } }),
    prisma.experienceMedia.findMany({ where: { url }, select: { experience: { select: { id: true, name: true } } } }),
    prisma.blog.findMany({ where: { featuredImage: url }, select: { id: true, title: true } }),
    prisma.testimonial.findMany({ where: { imageUrl: url }, select: { id: true, travelerName: true } }),
    prisma.teamMember.findMany({ where: { photoUrl: url }, select: { id: true, name: true } }),
    prisma.heroBanner.findMany({ where: { mediaUrl: url }, select: { id: true, heading: true } }),
    prisma.pageSection.findMany({ where: { imageUrl: url }, select: { id: true, title: true } }),
    prisma.siteSetting.findMany({ where: { value: url }, select: { key: true } }),
  ]);

  const out: Usage[] = [
    ...dest.map((d) => ({ label: `Destination: ${d.name}`, href: `/admin/destinations/${d.id}` })),
    ...destM.map((x) => ({ label: `Destination gallery: ${x.destination.name}`, href: `/admin/destinations/${x.destination.id}` })),
    ...place.map((p) => ({ label: `Place: ${p.name}`, href: `/admin/destinations/${p.destinationId}/places/${p.id}` })),
    ...placeM.map((x) => ({ label: `Place gallery: ${x.place.name}`, href: `/admin/destinations/${x.place.destinationId}/places/${x.place.id}` })),
    ...pkg.map((p) => ({ label: `Package: ${p.name}`, href: `/admin/packages/${p.id}` })),
    ...pkgM.map((x) => ({ label: `Package gallery: ${x.package.name}`, href: `/admin/packages/${x.package.id}` })),
    ...exp.map((e) => ({ label: `Experience: ${e.name}`, href: `/admin/experiences/${e.id}` })),
    ...expM.map((x) => ({ label: `Experience gallery: ${x.experience.name}`, href: `/admin/experiences/${x.experience.id}` })),
    ...blog.map((b) => ({ label: `Blog: ${b.title}`, href: `/admin/blogs/${b.id}` })),
    ...testi.map((t) => ({ label: `Testimonial: ${t.travelerName}`, href: `/admin/testimonials/${t.id}` })),
    ...member.map((m) => ({ label: `Team member: ${m.name}`, href: `/admin/team/members/${m.id}` })),
    ...banner.map((b) => ({ label: `Hero banner: ${b.heading ?? "(no heading)"}` })),
    ...section.map((s) => ({ label: `Page section: ${s.title ?? "(untitled)"}` })),
    ...setting.map((s) => ({ label: `Setting: ${s.key}`, href: "/admin/settings" })),
  ];
  return out;
}

// Every Cloudinary URL already stored in site content (used by "Import existing")
export async function collectContentUrls(): Promise<string[]> {
  const rows = await Promise.all([
    prisma.destination.findMany({ select: { bannerImage: true, thumbnailImage: true } }),
    prisma.destinationMedia.findMany({ select: { url: true } }),
    prisma.place.findMany({ select: { heroImage: true, thumbnailImage: true } }),
    prisma.placeMedia.findMany({ select: { url: true } }),
    prisma.tourPackage.findMany({ select: { heroImage: true, thumbnailImage: true } }),
    prisma.packageMedia.findMany({ select: { url: true } }),
    prisma.experience.findMany({ select: { heroImage: true, thumbnailImage: true } }),
    prisma.experienceMedia.findMany({ select: { url: true } }),
    prisma.blog.findMany({ select: { featuredImage: true } }),
    prisma.testimonial.findMany({ select: { imageUrl: true } }),
    prisma.teamMember.findMany({ select: { photoUrl: true } }),
    prisma.heroBanner.findMany({ select: { mediaUrl: true } }),
    prisma.pageSection.findMany({ select: { imageUrl: true } }),
    prisma.siteSetting.findMany({ select: { value: true } }),
  ]);
  const all = (rows.flat() as Record<string, string | null>[]).flatMap((r) => Object.values(r));
  return [...new Set(all.filter((v): v is string => typeof v === "string" && v.startsWith("https://res.cloudinary.com/")))];
}

// https://res.cloudinary.com/<cloud>/<image|video|raw>/upload/v123/folder/file.jpg  ->  parts
export function parseCloudinaryUrl(url: string) {
  const m = /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+)$/.exec(url);
  if (!m) return null;
  const resourceType = m[1];
  const path = m[2];
  const name = decodeURIComponent(path.split("/").pop() ?? path);
  const publicId = resourceType === "raw" ? path : path.replace(/\.[a-z0-9]+$/i, "");
  return { resourceType, publicId, name };
}
