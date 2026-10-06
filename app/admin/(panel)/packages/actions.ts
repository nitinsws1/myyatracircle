"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { cleanHtml } from "@/lib/sanitize";
import { parseGallery } from "@/lib/gallery";
import { parseStringList, parseItinerary } from "@/lib/lists";
import type { FormState } from "@/lib/form-state";

const isUrl = (v: string) => /^(https?:\/\/|\/)/.test(v);

function parse(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);
  const intOrNull = (v: string) => (v === "" || isNaN(Number(v)) ? null : Math.trunc(Number(v)));

  const errors: Record<string, string> = {};
  const name = get("name");
  if (name.length < 2) errors.name = "Name must be at least 2 characters";
  const slug = slugify(get("slug") || name);
  if (!slug) errors.slug = "Could not create a slug";

  const durationDays = intOrNull(get("durationDays"));
  const durationNights = intOrNull(get("durationNights"));
  if (durationDays !== null && (durationDays < 0 || durationDays > 365)) errors.durationDays = "Enter 0 to 365";
  if (durationNights !== null && (durationNights < 0 || durationNights > 365)) errors.durationNights = "Enter 0 to 365";

  for (const k of ["heroImage", "thumbnailImage"]) {
    if (get(k) && !isUrl(get(k))) errors[k] = "Invalid media URL";
  }

  const status = get("status") === "PUBLISHED" ? ("PUBLISHED" as const) : ("DRAFT" as const);

  const { gallery, error: galleryError } = parseGallery(get("gallery"));
  if (galleryError) errors.gallery = galleryError;
  else if (status === "PUBLISHED" && gallery.length < 1) {
    errors.gallery = "Add at least 1 image or video to the gallery before publishing";
  }

  const { itinerary, error: itineraryError } = parseItinerary(get("itinerary"));
  if (itineraryError) errors.itinerary = itineraryError;

  const highlights = parseStringList(get("highlights")).map((text, i) => ({ text, sortOrder: i }));
  const inclusions = [
    ...parseStringList(get("inclusions")).map((text, i) => ({ kind: "INCLUSION" as const, text, sortOrder: i })),
    ...parseStringList(get("exclusions")).map((text, i) => ({ kind: "EXCLUSION" as const, text, sortOrder: i })),
  ];
  const destinationIds = [
    ...new Set(fd.getAll("destinationIds").map(Number).filter((n) => Number.isInteger(n))),
  ];

  const data = {
    name,
    slug,
    durationDays,
    durationNights,
    shortDescription: orNull(get("shortDescription")),
    overview: orNull(cleanHtml(get("overview"))),
    heroImage: orNull(get("heroImage")),
    heroType: get("heroType") === "VIDEO" ? ("VIDEO" as const) : ("IMAGE" as const),
    thumbnailImage: orNull(get("thumbnailImage")),
    isFeatured: fd.get("isFeatured") === "on",
    featuredOrder: intOrNull(get("featuredOrder")),
    sortOrder: intOrNull(get("sortOrder")) ?? 0,
    status,
    metaTitle: orNull(get("metaTitle")),
    metaDescription: orNull(get("metaDescription")),
    metaKeywords: orNull(get("metaKeywords")),
  };
  return { errors, data, gallery, itinerary, highlights, inclusions, destinationIds };
}

function saveError(e: unknown): FormState {
  const code = (e as { code?: string }).code;
  if (code === "P2002") return { errors: { slug: "This slug is already used by another package" } };
  if (code === "P2003") return { message: "A selected destination no longer exists. Reload the page and try again." };
  console.error(e);
  return { message: "Something went wrong while saving. Please try again." };
}

const refresh = () => revalidatePath("/admin/packages");

export async function createPackage(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const p = parse(fd);
  if (Object.keys(p.errors).length) return { errors: p.errors };

  try {
    // package + all its children are created together, or not at all
    await prisma.tourPackage.create({
      data: {
        ...p.data,
        gallery: { create: p.gallery },
        highlights: { create: p.highlights },
        inclusions: { create: p.inclusions },
        itinerary: { create: p.itinerary },
        destinations: { create: p.destinationIds.map((destinationId) => ({ destinationId })) },
      },
    });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/packages");
}

export async function updatePackage(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const p = parse(fd);
  if (Object.keys(p.errors).length) return { errors: p.errors };

  try {
    // update the package, then replace each child list (simple and safe for short lists)
    await prisma.$transaction(async (tx) => {
      await tx.tourPackage.update({ where: { id }, data: p.data });

      await tx.packageMedia.deleteMany({ where: { packageId: id } });
      await tx.packageHighlight.deleteMany({ where: { packageId: id } });
      await tx.packageInclusion.deleteMany({ where: { packageId: id } });
      await tx.itineraryDay.deleteMany({ where: { packageId: id } });
      await tx.packageDestination.deleteMany({ where: { packageId: id } });

      if (p.gallery.length) await tx.packageMedia.createMany({ data: p.gallery.map((g) => ({ ...g, packageId: id })) });
      if (p.highlights.length) await tx.packageHighlight.createMany({ data: p.highlights.map((h) => ({ ...h, packageId: id })) });
      if (p.inclusions.length) await tx.packageInclusion.createMany({ data: p.inclusions.map((i) => ({ ...i, packageId: id })) });
      if (p.itinerary.length) await tx.itineraryDay.createMany({ data: p.itinerary.map((d) => ({ ...d, packageId: id })) });
      if (p.destinationIds.length) {
        await tx.packageDestination.createMany({ data: p.destinationIds.map((destinationId) => ({ packageId: id, destinationId })) });
      }
    });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/packages");
}

export async function deletePackage(id: number) {
  await requireAdmin();
  // children are deleted by cascade; inquiries stay (their package link becomes empty)
  await prisma.tourPackage.delete({ where: { id } });
  refresh();
}
