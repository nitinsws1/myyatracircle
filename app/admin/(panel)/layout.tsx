import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/admin/Sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  // Fetch the logo image record from the Media table
  const logoMedia = await prisma.media.findFirst({
  where: { kind: "LOGO" },
  select: { url: true, name: true },
});

const logoUrl = logoMedia?.url ?? (logoMedia ? `/uploads/${logoMedia.name}` : null);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <Sidebar adminName={admin.name} logoUrl={logoUrl} />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}