import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// The logged-in admin, or null. Besides the cookie it checks the database:
// the admin must still exist, be active, and must not have changed the password
// (or clicked "sign out everywhere") after this login was created.
export const getAdmin = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminId } });
  if (!admin || !admin.isActive) return null;

  if (admin.passwordChangedAt) {
    const issuedAtMs = (session.iat ?? 0) * 1000;
    if (issuedAtMs < admin.passwordChangedAt.getTime()) return null; // an old login
  }
  return admin;
});

// Call this at the top of EVERY server action that changes data.
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
