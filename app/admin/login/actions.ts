"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  // same message for "no such user" and "wrong password" on purpose
  const ok = admin && admin.isActive && (await bcrypt.compare(password, admin.passwordHash));
  if (!admin || !ok) return { error: "Invalid email or password" };

  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await createSession(admin.id);
  redirect("/admin");
}
