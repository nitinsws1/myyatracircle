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
const refresh = () => revalidatePath("/admin/pages");

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

export async function createPage(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parse(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.page.create({ data });
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

  const { errors, data } = parse(fd, isSystemSlug(existing.slug) ? existing.slug : undefined);

  // extra blocks (About Us: brand story, vision, mission, expertise)
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const blocks = (PAGE_SECTIONS[existing.slug] ?? []).map((def, i) => {
    const title = get(`section_${def.key}_title`);
    const content = cleanHtml(get(`section_${def.key}_content`));
    const imageUrl = get(`section_${def.key}_image`);
    if (title.length > 150) errors[`section_${def.key}_title`] = "Keep the heading under 150 characters";
    if (imageUrl && !isUrl(imageUrl)) errors[`section_${def.key}_image`] = "Invalid image URL";
    return { sectionKey: def.key, title: title || null, content: content || null, imageUrl: imageUrl || null, sortOrder: i };
  });
  if (Object.keys(errors).length) return { errors };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.page.update({ where: { id }, data });
      for (const b of blocks) {
        const empty = !b.title && !b.content && !b.imageUrl;
        if (empty) {
          await tx.pageSection.deleteMany({ where: { pageId: id, sectionKey: b.sectionKey } });
        } else {
          await tx.pageSection.upsert({
            where: { pageId_sectionKey: { pageId: id, sectionKey: b.sectionKey } },
            update: { title: b.title, content: b.content, imageUrl: b.imageUrl, sortOrder: b.sortOrder },
            create: { pageId: id, ...b },
          });
        }
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
  refresh();
}

export async function togglePage(id: number) {
  await requireAdmin();
  const p = await prisma.page.findUnique({ where: { id } });
  if (!p) return;
  await prisma.page.update({ where: { id }, data: { isActive: !p.isActive } });
  refresh();
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
