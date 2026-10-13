"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { cleanHtml } from "@/lib/sanitize";
import { PAGE_SECTIONS, RESERVED_SLUGS, SYSTEM_PAGES, isSystemSlug } from "@/lib/cms-config";
import type { FormState } from "@/lib/form-state";

const isUrl = (v: string) => /^(https?:\/\/|\/)/.test(v);
const refresh = (slug?: string) => {
  revalidatePath("/admin/pages");
  revalidatePath("/admin/content");
  if (slug) {
    revalidatePath(`/${slug}`);
    if (slug === "about-us") revalidatePath("/about");
  } else {
    revalidatePath("/about");
  }
};

function parse(fd: FormData, lockedSlug?: string) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);

  const errors: Record<string, string> = {};
  const title = get("title");
  if (title.length < 2 || title.length > 150) errors.title = "Title must be 2 to 150 characters";

  // default pages keep their URL no matter what the form sends
  const slug = lockedSlug ?? slugify(get("slug") || title);
  if (!slug) errors.slug = "Could not create a slug";
  else if (!lockedSlug && !isSystemSlug(slug) && RESERVED_SLUGS.includes(slug)) {
    errors.slug = "This URL is used by the website already. Choose another one.";
  }

  const data = {
    title,
    slug,
    content: orNull(cleanHtml(get("content"))),
    isActive: fd.get("isActive") === "on",
    metaTitle: orNull(get("metaTitle")),
    metaDescription: orNull(get("metaDescription")),
    metaKeywords: orNull(get("metaKeywords")),
  };
  return { errors, data };
}

function saveError(e: unknown): FormState {
  if ((e as { code?: string }).code === "P2002") return { errors: { slug: "This URL is already used by another page" } };
  console.error(e);
  return { message: "Something went wrong while saving. Please try again." };
}

function parseSections(fd: FormData, slug: string) {
  const errors: Record<string, string> = {};
  const rawJson = fd.get("sectionsData");
  let rawList: Array<{ id?: number; sectionKey?: string; title?: string; content?: string; imageUrl?: string }> = [];

  if (typeof rawJson === "string" && rawJson.trim()) {
    try {
      rawList = JSON.parse(rawJson);
    } catch {}
  } else {
    const legacyDefs = PAGE_SECTIONS[slug] ?? [];
    for (const def of legacyDefs) {
      const title = String(fd.get(`section_${def.key}_title`) ?? "").trim();
      const content = String(fd.get(`section_${def.key}_content`) ?? "").trim();
      const imageUrl = String(fd.get(`section_${def.key}_image`) ?? "").trim();
      if (title || content || imageUrl) {
        rawList.push({ sectionKey: def.key, title, content, imageUrl });
      }
    }
  }

  const usedKeys = new Set<string>();
  const blocks: { sectionKey: string; title: string | null; content: string | null; imageUrl: string | null; sortOrder: number }[] = [];

  rawList.forEach((item, i) => {
    const rawTitle = (item.title ?? "").trim();
    const rawContent = cleanHtml(item.content ?? "");
    const rawImage = (item.imageUrl ?? "").trim();

    if (rawTitle.length > 150) {
      errors[`section_${i}_title`] = "Keep the heading under 150 characters";
    }
    if (rawImage && !isUrl(rawImage)) {
      errors[`section_${i}_image`] = "Invalid image URL";
    }

    let baseKey = slugify(item.sectionKey?.trim() || rawTitle || `section-${i + 1}`);
    if (!baseKey) baseKey = `section-${i + 1}`;
    let finalKey = baseKey;
    let counter = 2;
    while (usedKeys.has(finalKey)) {
      finalKey = `${baseKey}-${counter}`;
      counter++;
    }
    usedKeys.add(finalKey);

    blocks.push({
      sectionKey: finalKey,
      title: rawTitle || null,
      content: rawContent || null,
      imageUrl: rawImage || null,
      sortOrder: i,
    });
  });

  return { errors, blocks };
}

export async function createPage(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors: pageErrors, data } = parse(fd);
  const { errors: sectionErrors, blocks } = parseSections(fd, data.slug);
  const errors = { ...pageErrors, ...sectionErrors };
  if (Object.keys(errors).length) return { errors };

  try {
    await prisma.$transaction(async (tx) => {
      const page = await tx.page.create({ data });
      for (const b of blocks) {
        await tx.pageSection.create({
          data: { pageId: page.id, ...b },
        });
      }
    });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/pages");
}

export async function updatePage(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return { message: "This page no longer exists." };

  const { errors: pageErrors, data } = parse(fd, isSystemSlug(existing.slug) ? existing.slug : undefined);
  const { errors: sectionErrors, blocks } = parseSections(fd, existing.slug);
  const errors = { ...pageErrors, ...sectionErrors };
  if (Object.keys(errors).length) return { errors };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.page.update({ where: { id }, data });
      const activeKeys = blocks.map((b) => b.sectionKey);
      await tx.pageSection.deleteMany({
        where: { pageId: id, sectionKey: { notIn: activeKeys } },
      });
      for (const b of blocks) {
        await tx.pageSection.upsert({
          where: { pageId_sectionKey: { pageId: id, sectionKey: b.sectionKey } },
          update: { title: b.title, content: b.content, imageUrl: b.imageUrl, sortOrder: b.sortOrder },
          create: { pageId: id, ...b },
        });
      }
    });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/pages");
}

export async function deletePage(id: number) {
  await requireAdmin();
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page || isSystemSlug(page.slug)) return; // default pages cannot be deleted
  await prisma.page.delete({ where: { id } }); // its sections go with it (cascade)
  refresh(page.slug);
}

export async function togglePage(id: number) {
  await requireAdmin();
  const p = await prisma.page.findUnique({ where: { id } });
  if (!p) return;
  await prisma.page.update({ where: { id }, data: { isActive: !p.isActive } });
  refresh(p.slug);
}

// Creates the pages the website expects (hidden until content is added). Safe to click twice.
export async function createDefaultPages() {
  await requireAdmin();
  for (const sp of SYSTEM_PAGES) {
    await prisma.page.upsert({
      where: { slug: sp.slug },
      update: {},
      create: { slug: sp.slug, title: sp.title, isActive: false },
    });
  }
  refresh();
}
