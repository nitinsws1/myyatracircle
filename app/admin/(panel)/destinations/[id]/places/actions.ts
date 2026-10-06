"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { cleanHtml } from "@/lib/sanitize";
import { parseGallery } from "@/lib/gallery";
import type { FormState } from "@/lib/form-state";

const isUrl = (v: string) => /^(https?:\/\/|\/)/.test(v);

function parse(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);

  const errors: Record<string, string> = {};
  const name = get("name");
  if (name.length < 2) errors.name = "Name must be at least 2 characters";

  const slug = slugify(get("slug") || name);
  if (!slug) errors.slug = "Could not create a slug";

  for (const k of ["heroImage", "thumbnailImage"]) {
    if (get(k) && !isUrl(get(k))) errors[k] = "Invalid media URL";
  }

  const status = get("status") === "PUBLISHED" ? ("PUBLISHED" as const) : ("DRAFT" as const);

  const { gallery, error: galleryError } = parseGallery(get("gallery"));
  if (galleryError) errors.gallery = galleryError;
  else if (status === "PUBLISHED" && gallery.length < 1) {
    errors.gallery = "Add at least 1 image or video to the gallery before publishing";
  }

  const sort = Number(get("sortOrder"));
  const data = {
    name,
    slug,
    about: orNull(cleanHtml(get("about"))),
    heroImage: orNull(get("heroImage")),
    heroType: get("heroType") === "VIDEO" ? ("VIDEO" as const) : ("IMAGE" as const),
    thumbnailImage: orNull(get("thumbnailImage")),
    sortOrder: Number.isFinite(sort) ? Math.trunc(sort) : 0,
    status,
    metaTitle: orNull(get("metaTitle")),
    metaDescription: orNull(get("metaDescription")),
  };
  return { errors, data, gallery };
}

function saveError(e: unknown): FormState {
  if ((e as { code?: string }).code === "P2002") {
    return { errors: { slug: "This slug is already used by another place. Try adding the city, e.g. city-palace-jaipur" } };
  }
  console.error(e);
  return { message: "Something went wrong while saving. Please try again." };
}

function refresh(destinationId: number) {
  revalidatePath(`/admin/destinations/${destinationId}/places`);
  revalidatePath("/admin/destinations");
}

export async function createPlace(destinationId: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data, gallery } = parse(fd);
  if (Object.keys(errors).length) return { errors };

  try {
    await prisma.place.create({ data: { ...data, destinationId, gallery: { create: gallery } } });
  } catch (e) {
    return saveError(e);
  }
  refresh(destinationId);
  redirect(`/admin/destinations/${destinationId}/places`);
}

export async function updatePlace(
  destinationId: number,
  placeId: number,
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  await requireAdmin();
  const { errors, data, gallery } = parse(fd);
  if (Object.keys(errors).length) return { errors };

  try {
    await prisma.$transaction(async (tx) => {
      const r = await tx.place.updateMany({ where: { id: placeId, destinationId }, data });
      if (r.count === 0) throw new Error("NOT_FOUND");
      await tx.placeMedia.deleteMany({ where: { placeId } });
      if (gallery.length) {
        await tx.placeMedia.createMany({ data: gallery.map((g) => ({ ...g, placeId })) });
      }
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") return { message: "This place no longer exists." };
    return saveError(e);
  }
  refresh(destinationId);
  redirect(`/admin/destinations/${destinationId}/places`);
}

export async function deletePlace(destinationId: number, placeId: number) {
  await requireAdmin();
  await prisma.place.deleteMany({ where: { id: placeId, destinationId } });
  refresh(destinationId);
}
