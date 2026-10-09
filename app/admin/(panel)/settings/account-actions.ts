"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createSession } from "@/lib/session";
import type { AccountState } from "@/lib/account-types";

// Whole seconds only: a JWT stores its creation time in seconds, so comparing it with a
// time that has milliseconds would wrongly reject the brand new login we create below.
const nowInSeconds = () => new Date(Math.floor(Date.now() / 1000) * 1000);

export async function updateProfile(_prev: AccountState, fd: FormData): Promise<AccountState> {
  const admin = await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 80) return { ok: false, errors: { name: "Name must be 2 to 80 characters" } };

  await prisma.adminUser.update({ where: { id: admin.id }, data: { name } });
  revalidatePath("/admin", "layout"); // the sidebar shows the name
  return { ok: true, message: "Profile saved" };
}

export async function changePassword(_prev: AccountState, fd: FormData): Promise<AccountState> {
  const admin = await requireAdmin();

  // passwords are NOT trimmed, spaces can be part of a password
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  const errors: Record<string, string> = {};
  if (!current) errors.current = "Enter your current password";
  else if (!(await bcrypt.compare(current, admin.passwordHash))) errors.current = "Current password is incorrect";

  if (next.length < 8) errors.next = "Use at least 8 characters";
  else if (Buffer.byteLength(next) > 72) errors.next = "Use at most 72 characters";
  else if (!/[A-Za-z]/.test(next) || !/\d/.test(next)) errors.next = "Include at least one letter and one number";
  else if (next === current) errors.next = "The new password must be different from the current one";
  else if (next.toLowerCase() === admin.email.toLowerCase()) errors.next = "Do not use your email as the password";

  if (confirm !== next) errors.confirm = "The two passwords do not match";
  if (Object.keys(errors).length) return { ok: false, errors };

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(next, 12), passwordChangedAt: nowInSeconds() },
  });

  // every other device is signed out now; this browser gets a fresh login so you stay in
  await createSession(admin.id);
  revalidatePath("/admin/settings");
  return { ok: true, message: "Password changed. Any other device that was signed in has been signed out." };
}

export async function signOutEverywhere(): Promise<AccountState> {
  const admin = await requireAdmin();
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordChangedAt: nowInSeconds() } });
  await createSession(admin.id); // keep this browser signed in
  revalidatePath("/admin/settings");
  return { ok: true, message: "All other devices have been signed out." };
}
