"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { cleanHtml } from "@/lib/sanitize";
import { parseGallery } from "@/lib/gallery";
import { parseStringList } from "@/lib/lists";
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

  for (const k of ["heroImage", "thumbnailImage"]) {
    if (get(k) && !isUrl(get(k))) errors[k] = "Invalid media URL";
  }

  const status = get("status") === "PUBLISHED" ? ("PUBLISHED" as const) : ("DRAFT" as const);

  const { gallery, error: galleryError } = parseGallery(get("gallery"));
  if (galleryError) errors.gallery = galleryError;
  else if (status === "PUBLISHED" && gallery.length < 1) {
    errors.gallery = "Add at least 1 image or video to the gallery before publishing";
  }

  const highlights = parseStringList(get("highlights")).map((text, i) => ({ text, sortOrder: i }));
  const destinationIds = [
    ...new Set(fd.getAll("destinationIds").map(Number).filter((n) => Number.isInteger(n))),
  ];

  const data = {
    name,
    slug,
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
  return { errors, data, gallery, highlights, destinationIds };
}

function saveError(e: unknown): FormState {
  const code = (e as { code?: string }).code;
  if (code === "P2002") return { errors: { slug: "This slug is already used by another experience" } };
  if (code === "P2003") return { message: "A selected destination no longer exists. Reload the page and try again." };
  console.error(e);
  return { message: "Something went wrong while saving. Please try again." };
}

const refresh = () => revalidatePath("/admin/experiences");

export async function createExperience(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const p = parse(fd);
  if (Object.keys(p.errors).length) return { errors: p.errors };

  try {
    await prisma.experience.create({
      data: {
        ...p.data,
        gallery: { create: p.gallery },
        highlights: { create: p.highlights },
        destinations: { create: p.destinationIds.map((destinationId) => ({ destinationId })) },
      },
    });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/experiences");
}

export async function updateExperience(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const p = parse(fd);
  if (Object.keys(p.errors).length) return { errors: p.errors };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.experience.update({ where: { id }, data: p.data });

      await tx.experienceMedia.deleteMany({ where: { experienceId: id } });
      await tx.experienceHighlight.deleteMany({ where: { experienceId: id } });
      await tx.experienceDestination.deleteMany({ where: { experienceId: id } });

      if (p.gallery.length) await tx.experienceMedia.createMany({ data: p.gallery.map((g) => ({ ...g, experienceId: id })) });
      if (p.highlights.length) await tx.experienceHighlight.createMany({ data: p.highlights.map((h) => ({ ...h, experienceId: id })) });
      if (p.destinationIds.length) {
        await tx.experienceDestination.createMany({ data: p.destinationIds.map((destinationId) => ({ experienceId: id, destinationId })) });
      }
    });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/experiences");
}

export async function deleteExperience(id: number) {
  await requireAdmin();
  await prisma.experience.delete({ where: { id } }); // highlights, gallery and links go with it
  refresh();
}
