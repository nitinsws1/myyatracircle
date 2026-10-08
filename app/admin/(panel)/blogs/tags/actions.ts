"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import type { RowState } from "@/lib/content-config";

const refresh = () => {
  revalidatePath("/admin/blogs/tags");
  revalidatePath("/admin/blogs");
};

function parse(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim().replace(/\s+/g, " ");
  const slug = slugify(name);
  if (name.length < 2 || name.length > 30 || !slug) return { error: "Tag must be 2 to 30 characters" } as const;
  return { data: { name, slug } } as const;
}

const duplicate = (e: unknown) => (e as { code?: string }).code === "P2002";

export async function createTag(_prev: RowState, fd: FormData): Promise<RowState> {
  await requireAdmin();
  const p = parse(fd);
  if ("error" in p) return { ok: false, error: p.error };
  try {
    await prisma.tag.create({ data: p.data });
  } catch (e) {
    return { ok: false, error: duplicate(e) ? "This tag already exists" : "Could not save the tag" };
  }
  refresh();
  return { ok: true };
}

export async function updateTag(id: number, _prev: RowState, fd: FormData): Promise<RowState> {
  await requireAdmin();
  const p = parse(fd);
  if ("error" in p) return { ok: false, error: p.error };
  try {
    await prisma.tag.update({ where: { id }, data: p.data });
  } catch (e) {
    return { ok: false, error: duplicate(e) ? "Another tag already uses this name" : "Could not save the tag" };
  }
  refresh();
  return { ok: true };
}

export async function deleteTag(id: number) {
  await requireAdmin();
  await prisma.tag.deleteMany({ where: { id } }); // it is removed from every post that used it
  refresh();
}
