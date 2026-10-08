"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { cleanHtml } from "@/lib/sanitize";
import type { FormState } from "@/lib/form-state";

// The date box sends "2026-10-05T14:30" with NO timezone, so the browser also sends its offset
// (new Date().getTimezoneOffset(), e.g. -330 for India). That way the saved time is correct
// even when the server runs in another timezone.
function parseLocalDate(value: string, tzOffsetMin: number): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m || !Number.isFinite(tzOffsetMin) || Math.abs(tzOffsetMin) > 900) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, mi) + tzOffsetMin * 60_000);
}

function parse(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);

  const errors: Record<string, string> = {};
  const title = get("title");
  if (title.length < 3) errors.title = "Title must be at least 3 characters";
  const slug = slugify(get("slug") || title);
  if (!slug) errors.slug = "Could not create a slug";

  const content = cleanHtml(get("content"));
  if (!content) errors.content = "Content is required";

  const featuredImage = get("featuredImage");
  if (featuredImage && !/^(https?:\/\/|\/)/.test(featuredImage)) errors.featuredImage = "Invalid image URL";

  const categoryId = get("categoryId") === "" ? null : Number(get("categoryId"));
  if (categoryId !== null && !Number.isInteger(categoryId)) errors.categoryId = "Invalid category";

  const status = get("status") === "PUBLISHED" ? ("PUBLISHED" as const) : ("DRAFT" as const);

  const authorName = get("authorName");
  if (authorName.length > 80) errors.authorName = "Keep the author name under 80 characters";

  // tags arrive as JSON text: ["Hidden gems", "Beaches"]
  const tags: { name: string; slug: string }[] = [];
  try {
    const raw = JSON.parse(get("tags") || "[]");
    if (!Array.isArray(raw) || raw.length > 10) throw new Error();
    for (const t of raw) {
      const name = String(t ?? "").trim().replace(/\s+/g, " ");
      const slug = slugify(name);
      if (!name || name.length > 30 || !slug) throw new Error();
      if (!tags.some((x) => x.slug === slug)) tags.push({ name, slug });
    }
  } catch {
    errors.tags = "Use up to 10 tags, each up to 30 characters";
  }

  let publishedAt: Date | null = null;
  if (get("publishedAt")) {
    publishedAt = parseLocalDate(get("publishedAt"), Number(get("tzOffset")));
    if (!publishedAt) errors.publishedAt = "Invalid date";
  }
  // publishing with no date means "publish now"; a future date means "scheduled"
  if (status === "PUBLISHED" && !publishedAt && !errors.publishedAt) publishedAt = new Date();

  const data = {
    title,
    slug,
    categoryId,
    authorName: orNull(authorName),
    shortDescription: orNull(get("shortDescription")),
    content,
    featuredImage: orNull(featuredImage),
    publishedAt,
    isFeatured: fd.get("isFeatured") === "on",
    status,
    metaTitle: orNull(get("metaTitle")),
    metaDescription: orNull(get("metaDescription")),
    metaKeywords: orNull(get("metaKeywords")),
  };
  return { errors, data, tags };
}

function saveError(e: unknown): FormState {
  const code = (e as { code?: string }).code;
  if (code === "P2002") return { errors: { slug: "This slug is already used by another blog" } };
  if (code === "P2003") return { errors: { categoryId: "This category no longer exists. Reload the page." } };
  console.error(e);
  return { message: "Something went wrong while saving. Please try again." };
}

// Finds each tag by slug, creates the missing ones, returns all the ids
type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
async function ensureTags(tx: Tx, tags: { name: string; slug: string }[]) {
  const ids: number[] = [];
  for (const t of tags) {
    const row = await tx.tag.upsert({ where: { slug: t.slug }, update: {}, create: t });
    ids.push(row.id);
  }
  return ids;
}

const refresh = () => {
  revalidatePath("/admin/blogs");
  revalidatePath("/admin/blogs/tags");
};

export async function createBlog(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data, tags } = parse(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.$transaction(async (tx) => {
      const ids = await ensureTags(tx, tags);
      await tx.blog.create({ data: { ...data, tags: { connect: ids.map((id) => ({ id })) } } });
    });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/blogs");
}

export async function updateBlog(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data, tags } = parse(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.$transaction(async (tx) => {
      const ids = await ensureTags(tx, tags);
      await tx.blog.update({ where: { id }, data: { ...data, tags: { set: ids.map((tid) => ({ id: tid })) } } });
    });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/blogs");
}

export async function deleteBlog(id: number) {
  await requireAdmin();
  await prisma.blog.delete({ where: { id } });
  refresh();
}
