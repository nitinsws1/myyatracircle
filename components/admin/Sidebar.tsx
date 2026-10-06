"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MapPin, Package, Compass, MessageSquareQuote, Newspaper,
  HelpCircle, Users, FileText, Inbox, Settings, LogOut, Images,
} from "lucide-react";
import { logout } from "@/app/admin/actions";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Destinations", href: "/admin/destinations", icon: MapPin },
  { label: "Tour Packages", href: "/admin/packages", icon: Package },
  { label: "Experiences", href: "/admin/experiences", icon: Compass },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Blogs", href: "/admin/blogs", icon: Newspaper },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { label: "Team & Why Us", href: "/admin/team", icon: Users },
  { label: "Pages (CMS)", href: "/admin/pages", icon: FileText },
  { label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { label: "Media Library", href: "/admin/media", icon: Images },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-slate-900 text-slate-300 md:flex">
      <div className="px-6 py-5 text-lg font-semibold text-white">Myyatra Circle</div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-teal-700 text-white" : "hover:bg-slate-800 hover:text-white"
              }`}>
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="border-t border-slate-800 p-3">
        <p className="px-3 pb-2 text-xs text-slate-500">Signed in as {adminName}</p>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-800 hover:text-white">
          <LogOut size={18} /> Log out
        </button>
      </form>
    </aside>
  );
}
