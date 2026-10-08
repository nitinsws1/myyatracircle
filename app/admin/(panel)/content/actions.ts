"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { HOME_SECTIONS, HOME_SECTION_KEYS, PAGE_META_FIELDS, PUBLIC_PAGES, youtubeId, type RowState } from "@/lib/content-config";
import type { FormState } from "@/lib/form-state";
import type { SettingsState } from "@/lib/settings-config";

const get = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const isUrl = (v: string) => /^(https?:\/\/|\/)/.test(v);
const HERO_URL = "/admin/content/homepage?tab=hero";
const MAX_HERO = 8;

// refresh the admin screens AND the public site
const refresh = () => {
  revalidatePath("/admin/content", "layout");
  revalidatePath("/", "layout");
};
async function touchHomepage() {
  const value = new Date().toISOString();
  await prisma.siteSetting.upsert({ where: { key: "homepage.updatedAt" }, update: { value }, create: { key: "homepage.updatedAt", value } });
}

// ================= HOMEPAGE SECTIONS =================
export async function createDefaultSections() {
  await requireAdmin();
  const keys = HOME_SECTION_KEYS;
  for (const [i, key] of keys.entries()) {
    await prisma.homepageSection.upsert({
      where: { key },
      update: {},
      create: { key, title: HOME_SECTIONS[key].defaultTitle, sortOrder: i },
    });
  }
  await touchHomepage();
  refresh();
}

export async function saveSectionText(key: string, _prev: RowState, fd: FormData): Promise<RowState> {
  await requireAdmin();
  if (!HOME_SECTION_KEYS.includes(key)) return { ok: false, error: "Unknown section" };
  const title = get(fd, "title");
  const subtitle = get(fd, "subtitle");
  if (title.length > 100) return { ok: false, error: "Keep the title under 100 characters" };
  if (subtitle.length > 200) return { ok: false, error: "Keep the subtitle under 200 characters" };

  await prisma.homepageSection.updateMany({ where: { key }, data: { title: title || null, subtitle: subtitle || null } });
  await touchHomepage();
  refresh();
  return { ok: true };
}

export async function toggleSection(key: string) {
  await requireAdmin();
  const s = await prisma.homepageSection.findUnique({ where: { key } });
  if (!s) return;
  await prisma.homepageSection.update({ where: { key }, data: { isVisible: !s.isVisible } });
  await touchHomepage();
  refresh();
}

export async function moveSection(key: string, dir: -1 | 1) {
  await requireAdmin();
  const rows = await prisma.homepageSection.findMany({ orderBy: [{ sortOrder: "asc" }, { key: "asc" }], select: { key: true } });
  const keys = rows.map((r) => r.key);
  const i = keys.indexOf(key);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= keys.length) return;
  [keys[i], keys[j]] = [keys[j], keys[i]];
  await prisma.$transaction(keys.map((k, idx) => prisma.homepageSection.update({ where: { key: k }, data: { sortOrder: idx } })));
  await touchHomepage();
  refresh();
}

// ================= HERO BANNERS =================
function parseHero(fd: FormData) {
  const errors: Record<string, string> = {};
  const heading = get(fd, "heading");
  const subHeading = get(fd, "subHeading");
  const ctaText = get(fd, "ctaText");
  const ctaUrl = get(fd, "ctaUrl");
  if (heading.length > 120) errors.heading = "Keep the heading under 120 characters";
  if (subHeading.length > 250) errors.subHeading = "Keep the sub-heading under 250 characters";
  if (ctaText.length > 40) errors.ctaText = "Keep the button text under 40 characters";
  if (ctaText && !ctaUrl) errors.ctaUrl = "Add the button link, or clear the button text";
  if (ctaUrl && !/^(\/|https:\/\/)/.test(ctaUrl)) errors.ctaUrl = "Use a page like /packages or a full https:// link";

  let mediaUrl = "";
  let mediaType = "image";
  if (get(fd, "mode") === "youtube") {
    const id = youtubeId(get(fd, "youtubeUrl"));
    if (!id) errors.youtubeUrl = "Paste a valid YouTube link";
    else { mediaUrl = `https://www.youtube.com/watch?v=${id}`; mediaType = "youtube"; }
  } else {
    mediaUrl = get(fd, "mediaUrl");
    mediaType = get(fd, "mediaType") === "VIDEO" ? "video" : "image";
    if (!mediaUrl) errors.mediaUrl = "Choose an image or a video";
    else if (!isUrl(mediaUrl)) errors.mediaUrl = "Invalid media URL";
  }

  return {
    errors,
    data: {
      mediaUrl, mediaType,
      heading: heading || null, subHeading: subHeading || null,
      ctaText: ctaText || null, ctaUrl: ctaUrl || null,
      isActive: fd.get("isActive") === "on",
    },
  };
}

export async function createHero(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parseHero(fd);
  if (Object.keys(errors).length) return { errors };

  const [count, max] = await Promise.all([prisma.heroBanner.count(), prisma.heroBanner.aggregate({ _max: { sortOrder: true } })]);
  if (count >= MAX_HERO) return { message: `You can have at most ${MAX_HERO} hero banners. Delete one first.` };

  try {
    await prisma.heroBanner.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? -1) + 1 } });
  } catch (e) {
    console.error(e);
    return { message: "Something went wrong while saving. Please try again." };
  }
  await touchHomepage();
  refresh();
  redirect(HERO_URL);
}

export async function updateHero(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parseHero(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.heroBanner.update({ where: { id }, data });
  } catch (e) {
    console.error(e);
    return { message: "Something went wrong while saving. Please try again." };
  }
  await touchHomepage();
  refresh();
  redirect(HERO_URL);
}

export async function deleteHero(id: number) {
  await requireAdmin();
  await prisma.heroBanner.deleteMany({ where: { id } });
  await touchHomepage();
  refresh();
}

export async function toggleHero(id: number) {
  await requireAdmin();
  const h = await prisma.heroBanner.findUnique({ where: { id } });
  if (!h) return;
  await prisma.heroBanner.update({ where: { id }, data: { isActive: !h.isActive } });
  await touchHomepage();
  refresh();
}

export async function moveHero(id: number, dir: -1 | 1) {
  await requireAdmin();
  const rows = await prisma.heroBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } });
  const ids = rows.map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await prisma.$transaction(ids.map((rid, idx) => prisma.heroBanner.update({ where: { id: rid }, data: { sortOrder: idx } })));
  await touchHomepage();
  refresh();
}

// ================= PAGE HEADER + SEO (destinations, packages, ...) =================
export async function savePageMeta(slug: string, _prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requireAdmin();
  if (!PUBLIC_PAGES.some((p) => p.slug === slug)) return { message: "Unknown page" };

  const v = Object.fromEntries(PAGE_META_FIELDS.map((f) => [f, get(fd, f)])) as Record<(typeof PAGE_META_FIELDS)[number], string>;
  const errors: Record<string, string> = {};
  if (v.title.length > 100) errors.title = "Keep the heading under 100 characters";
  if (v.subtitle.length > 300) errors.subtitle = "Keep the subheading under 300 characters";
  if (v.banner && !isUrl(v.banner)) errors.banner = "Invalid banner URL";
  v.bannerType = v.bannerType === "VIDEO" ? "VIDEO" : "IMAGE";
  if (v.metaTitle.length > 100) errors.metaTitle = "Keep the meta title under 100 characters";
  if (v.metaDescription.length > 300) errors.metaDescription = "Keep the meta description under 300 characters";
  if (v.metaKeywords.length > 300) errors.metaKeywords = "Keep the keywords under 300 characters";
  if (Object.keys(errors).length) return { errors };

  try {
    await prisma.$transaction(
      PAGE_META_FIELDS.map((f) => {
        const key = `page.${slug}.${f}`;
        const value = f === "bannerType" && !v.banner ? null : v[f] || null;
        return prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
      })
    );
  } catch (e) {
    console.error(e);
    return { message: "Something went wrong while saving. Please try again." };
  }
  refresh();
  return { ok: true, message: "Page saved" };
}
