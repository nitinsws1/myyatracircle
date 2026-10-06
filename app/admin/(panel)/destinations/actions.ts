"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { cleanHtml } from "@/lib/sanitize";
import { parseGallery } from "@/lib/gallery";
import type { FormState } from "@/lib/form-state";

const isUrlOrPath = (v: string) => /^(https?:\/\/|\/)/.test(v);

function parse(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);
  const intOrNull = (v: string) => (v === "" || isNaN(Number(v)) ? null : Math.trunc(Number(v)));

  const errors: Record<string, string> = {};
  const name = get("name");
  if (name.length < 2) errors.name = "Name must be at least 2 characters";

  const slug = slugify(get("slug") || name);
  if (!slug) errors.slug = "Could not create a slug";

  for (const k of ["bannerImage", "thumbnailImage"]) {
    const v = get(k);
    if (v && !isUrlOrPath(v)) errors[k] = "Must start with http(s):// or /";
  }

  const status = get("status") === "PUBLISHED" ? ("PUBLISHED" as const) : ("DRAFT" as const);

  // gallery: max 5 always, at least 1 only when publishing
  const { gallery, error: galleryError } = parseGallery(get("gallery"));
  if (galleryError) errors.gallery = galleryError;
  else if (status === "PUBLISHED" && gallery.length < 1) {
    errors.gallery = "Add at least 1 image or video to the gallery before publishing";
  }

  const data = {
    name,
    slug,
    region: orNull(get("region")),
    state: orNull(get("state")),
    shortDescription: orNull(get("shortDescription")),
    overview: orNull(cleanHtml(get("overview"))),
    bannerImage: orNull(get("bannerImage")),
    bannerType: get("bannerType") === "VIDEO" ? ("VIDEO" as const) : ("IMAGE" as const),
    thumbnailImage: orNull(get("thumbnailImage")),
    isFeatured: fd.get("isFeatured") === "on",
    featuredOrder: intOrNull(get("featuredOrder")),
    sortOrder: intOrNull(get("sortOrder")) ?? 0,
    status,
    metaTitle: orNull(get("metaTitle")),
    metaDescription: orNull(get("metaDescription")),
    metaKeywords: orNull(get("metaKeywords")),
  };
  return { errors, data, gallery };
}

function saveError(e: unknown): FormState {
  if ((e as { code?: string }).code === "P2002") {
    return { errors: { slug: "This slug is already used by another destination" } };
  }
  console.error(e);
  return { message: "Something went wrong while saving. Please try again." };
}

export async function createDestination(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data, gallery } = parse(fd);
  if (Object.keys(errors).length) return { errors };

  try {
    await prisma.destination.create({ data: { ...data, gallery: { create: gallery } } });
  } catch (e) {
    return saveError(e);
  }
  revalidatePath("/admin/destinations");
  redirect("/admin/destinations");
}

export async function updateDestination(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data, gallery } = parse(fd);
  if (Object.keys(errors).length) return { errors };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.destination.update({ where: { id }, data });
      await tx.destinationMedia.deleteMany({ where: { destinationId: id } });
      if (gallery.length) {
        await tx.destinationMedia.createMany({ data: gallery.map((g) => ({ ...g, destinationId: id })) });
      }
    });
  } catch (e) {
    return saveError(e);
  }
  revalidatePath("/admin/destinations");
  redirect("/admin/destinations");
}

export async function deleteDestination(id: number) {
  await requireAdmin();
  await prisma.destination.delete({ where: { id } }); // places + gallery are removed by cascade
  revalidatePath("/admin/destinations");
}
