"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import type { FormState } from "@/lib/form-state";

function parse(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const errors: Record<string, string> = {};
  const name = get("name");
  if (name.length < 2 || name.length > 80) errors.name = "Name must be 2 to 80 characters";
  const slug = slugify(get("slug") || name);
  if (!slug) errors.slug = "Could not create a slug";
  return { errors, data: { name, slug } };
}

function saveError(e: unknown): FormState {
  if ((e as { code?: string }).code === "P2002") {
    return { errors: { slug: "This slug is already used by another category" } };
  }
  console.error(e);
  return { message: "Something went wrong while saving. Please try again." };
}

const refresh = () => {
  revalidatePath("/admin/blogs/categories");
  revalidatePath("/admin/blogs");
};

export async function createCategory(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parse(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.blogCategory.create({ data });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/blogs/categories");
}

export async function updateCategory(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parse(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.blogCategory.update({ where: { id }, data });
  } catch (e) {
    return saveError(e);
  }
  refresh();
  redirect("/admin/blogs/categories");
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  await prisma.blogCategory.delete({ where: { id } }); // its blogs stay, they just become uncategorized
  refresh();
}
