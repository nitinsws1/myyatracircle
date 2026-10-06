import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Call this at the top of EVERY server action that changes data.
// The proxy does not protect actions, anyone can call them directly.
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
