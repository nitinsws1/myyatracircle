"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";

function parse(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);
  const sort = Number(get("sortOrder"));

  const errors: Record<string, string> = {};
  const travelerName = get("travelerName");
  if (travelerName.length < 2 || travelerName.length > 100) errors.travelerName = "Enter the traveler's name (2 to 100 characters)";

  const feedback = get("feedback");
  if (feedback.length < 10) errors.feedback = "Feedback must be at least 10 characters";
  if (feedback.length > 1500) errors.feedback = "Feedback must be under 1500 characters";

  const imageUrl = get("imageUrl");
  if (imageUrl && !/^(https?:\/\/|\/)/.test(imageUrl)) errors.imageUrl = "Invalid image URL";

  const isApproved = fd.get("isApproved") === "on";
  const isFeatured = fd.get("isFeatured") === "on";
  if (isFeatured && !isApproved) errors.isFeatured = "Approve the testimonial first, only approved ones can be featured";

  const data = {
    travelerName,
    location: orNull(get("location")),
    feedback,
    imageUrl: orNull(imageUrl),
    isApproved,
    isFeatured,
    sortOrder: Number.isFinite(sort) ? Math.trunc(sort) : 0,
  };
  return { errors, data };
}

const refresh = () => revalidatePath("/admin/testimonials");

export async function createTestimonial(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parse(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.testimonial.create({ data });
  } catch (e) {
    console.error(e);
    return { message: "Something went wrong while saving. Please try again." };
  }
  refresh();
  redirect("/admin/testimonials");
}

export async function updateTestimonial(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = parse(fd);
  if (Object.keys(errors).length) return { errors };
  try {
    await prisma.testimonial.update({ where: { id }, data });
  } catch (e) {
    console.error(e);
    return { message: "Something went wrong while saving. Please try again." };
  }
  refresh();
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(id: number) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  refresh();
}

// One-click toggles used from the list page
export async function toggleTestimonial(id: number, field: "isApproved" | "isFeatured") {
  await requireAdmin();
  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (!t) return;

  if (field === "isApproved") {
    // un-approving also removes it from the homepage
    await prisma.testimonial.update({
      where: { id },
      data: { isApproved: !t.isApproved, ...(t.isApproved ? { isFeatured: false } : {}) },
    });
  } else if (t.isApproved) {
    await prisma.testimonial.update({ where: { id }, data: { isFeatured: !t.isFeatured } });
  }
  refresh();
}
