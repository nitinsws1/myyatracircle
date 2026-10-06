"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isStatus } from "@/lib/inquiry-config";

const refresh = () => revalidatePath("/admin/inquiries");

export async function updateInquiryStatus(type: string, id: number, status: string) {
  await requireAdmin();
  if (!isStatus(status)) return;

  // updateMany does nothing (instead of crashing) if the row was deleted meanwhile
  if (type === "contact") await prisma.contactInquiry.updateMany({ where: { id }, data: { status } });
  else if (type === "tour") await prisma.tourInquiry.updateMany({ where: { id }, data: { status } });
  else if (type === "holiday") await prisma.holidayInquiry.updateMany({ where: { id }, data: { status } });
  else return;
  refresh();
}

export async function deleteInquiry(type: string, id: number, redirectTo?: string) {
  await requireAdmin();
  if (type === "contact") await prisma.contactInquiry.deleteMany({ where: { id } });
  else if (type === "tour") await prisma.tourInquiry.deleteMany({ where: { id } });
  else if (type === "holiday") await prisma.holidayInquiry.deleteMany({ where: { id } });
  else return;
  refresh();
  if (redirectTo && redirectTo.startsWith("/admin/inquiries")) redirect(redirectTo);
}

export async function toggleSubscriber(id: number) {
  await requireAdmin();
  const s = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!s) return;
  await prisma.newsletterSubscriber.update({
    where: { id },
    data: s.isSubscribed
      ? { isSubscribed: false, unsubscribedAt: new Date() }
      : { isSubscribed: true, unsubscribedAt: null },
  });
  refresh();
}

export async function deleteSubscriber(id: number) {
  await requireAdmin();
  await prisma.newsletterSubscriber.deleteMany({ where: { id } });
  refresh();
}
