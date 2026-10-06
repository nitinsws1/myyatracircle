"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { cleanHtml } from "@/lib/sanitize";
import type { FormState } from "@/lib/form-state";

function parse(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const sort = Number(get("sortOrder"));

  const errors: Record<string, string> = {};
  const question = get("question");
  if (question.length < 5 || question.length > 300) errors.question = "Question must be 5 to 300 characters";

  const answer = cleanHtml(get("answer"));
  if (!answer) errors.answer = "Answer is required";

  const data = {
    question,
    answer,
    isActive: fd.get("isActive") === "on",
    sortOrder: Number.isFinite(sort) ? Math.trunc(sort) : 0,
  };
  return { errors, data };
}

const refresh = () => revalidatePath("/admin/faqs");

export async function createFaq(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parse(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.faq.create({ data });
  } catch (e) {
    console.error(e);
    return { message: "Something went wrong while saving. Please try again." };
  }
  refresh();
  redirect("/admin/faqs");
}

export async function updateFaq(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parse(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.faq.update({ where: { id }, data });
  } catch (e) {
    console.error(e);
    return { message: "Something went wrong while saving. Please try again." };
  }
  refresh();
  redirect("/admin/faqs");
}

export async function deleteFaq(id: number) {
  await requireAdmin();
  await prisma.faq.delete({ where: { id } });
  refresh();
}

export async function toggleFaq(id: number) {
  await requireAdmin();
  const f = await prisma.faq.findUnique({ where: { id } });
  if (!f) return;
  await prisma.faq.update({ where: { id }, data: { isActive: !f.isActive } });
  refresh();
}
