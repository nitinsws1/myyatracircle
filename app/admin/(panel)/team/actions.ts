"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { WHY_ICON_KEYS } from "@/lib/why-icons";
import type { FormState } from "@/lib/form-state";

const get = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const orNull = (v: string) => (v === "" ? null : v);
const refresh = () => revalidatePath("/admin/team");
const FAIL: FormState = { message: "Something went wrong while saving. Please try again." };

// ============ TEAM MEMBERS ============
function parseMember(fd: FormData) {
  const errors: Record<string, string> = {};
  const name = get(fd, "name");
  if (name.length < 2 || name.length > 100) errors.name = "Name must be 2 to 100 characters";
  const designation = get(fd, "designation");
  if (designation.length > 100) errors.designation = "Keep the designation under 100 characters";
  const bio = get(fd, "bio");
  if (bio.length > 1000) errors.bio = "Bio must be under 1000 characters";
  const photoUrl = get(fd, "photoUrl");
  if (photoUrl && !/^(https?:\/\/|\/)/.test(photoUrl)) errors.photoUrl = "Invalid image URL";

  return {
    errors,
    data: { name, designation: orNull(designation), bio: orNull(bio), photoUrl: orNull(photoUrl), isActive: fd.get("isActive") === "on" },
  };
}

export async function createMember(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parseMember(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    // new members go to the end of the list
    const max = await prisma.teamMember.aggregate({ _max: { sortOrder: true } });
    await prisma.teamMember.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? -1) + 1 } });
  } catch (e) {
    console.error(e);
    return FAIL;
  }
  refresh();
  redirect("/admin/team");
}

export async function updateMember(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parseMember(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.teamMember.update({ where: { id }, data });
  } catch (e) {
    console.error(e);
    return FAIL;
  }
  refresh();
  redirect("/admin/team");
}

export async function deleteMember(id: number) {
  await requireAdmin();
  await prisma.teamMember.deleteMany({ where: { id } });
  refresh();
}

export async function toggleMember(id: number) {
  await requireAdmin();
  const m = await prisma.teamMember.findUnique({ where: { id } });
  if (!m) return;
  await prisma.teamMember.update({ where: { id }, data: { isActive: !m.isActive } });
  refresh();
}

// ============ WHY CHOOSE US ============
function parseWhy(fd: FormData) {
  const errors: Record<string, string> = {};
  const title = get(fd, "title");
  if (title.length < 2 || title.length > 100) errors.title = "Title must be 2 to 100 characters";
  const description = get(fd, "description");
  if (description.length > 300) errors.description = "Description must be under 300 characters";
  const icon = get(fd, "icon");
  if (!WHY_ICON_KEYS.includes(icon)) errors.icon = "Please pick an icon";

  return { errors, data: { title, description: orNull(description), icon, isActive: fd.get("isActive") === "on" } };
}

export async function createWhy(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parseWhy(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    const max = await prisma.whyUsItem.aggregate({ _max: { sortOrder: true } });
    await prisma.whyUsItem.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? -1) + 1 } });
  } catch (e) {
    console.error(e);
    return FAIL;
  }
  refresh();
  redirect("/admin/team?tab=why");
}

export async function updateWhy(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parseWhy(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.whyUsItem.update({ where: { id }, data });
  } catch (e) {
    console.error(e);
    return FAIL;
  }
  refresh();
  redirect("/admin/team?tab=why");
}

export async function deleteWhy(id: number) {
  await requireAdmin();
  await prisma.whyUsItem.deleteMany({ where: { id } });
  refresh();
}

export async function toggleWhy(id: number) {
  await requireAdmin();
  const w = await prisma.whyUsItem.findUnique({ where: { id } });
  if (!w) return;
  await prisma.whyUsItem.update({ where: { id }, data: { isActive: !w.isActive } });
  refresh();
}

// ============ REORDER (up / down arrows) ============
// Reads the list in order, swaps two neighbours, then renumbers everything 0,1,2...
async function swap(kind: "member" | "why", id: number, dir: -1 | 1) {
  const orderBy = [{ sortOrder: "asc" as const }, { id: "asc" as const }];
  const rows =
    kind === "member"
      ? await prisma.teamMember.findMany({ orderBy, select: { id: true } })
      : await prisma.whyUsItem.findMany({ orderBy, select: { id: true } });

  const ids = rows.map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];

  await prisma.$transaction(
    ids.map((rid, idx) =>
      kind === "member"
        ? prisma.teamMember.update({ where: { id: rid }, data: { sortOrder: idx } })
        : prisma.whyUsItem.update({ where: { id: rid }, data: { sortOrder: idx } })
    )
  );
  refresh();
}

export async function moveMember(id: number, dir: -1 | 1) {
  await requireAdmin();
  await swap("member", id, dir);
}

export async function moveWhy(id: number, dir: -1 | 1) {
  await requireAdmin();
  await swap("why", id, dir);
}
