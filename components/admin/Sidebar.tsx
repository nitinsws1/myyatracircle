"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Package,
  Compass,
  MessageSquareQuote,
  Newspaper,
  HelpCircle,
  Users,
  LayoutTemplate,
  Inbox,
  Settings,
  LogOut,
  Images,
  MoreHorizontal,
  X,
} from "lucide-react";
import { logout } from "@/app/admin/actions";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { label: "Packages", href: "/admin/packages", icon: Package },
  { label: "Blogs", href: "/admin/blogs", icon: Newspaper },
  { label: "Destinations", href: "/admin/destinations", icon: MapPin },
  { label: "Experiences", href: "/admin/experiences", icon: Compass },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { label: "Team & Why Us", href: "/admin/team", icon: Users },
  { label: "Pages & Content", href: "/admin/content", icon: LayoutTemplate },
  { label: "Media Library", href: "/admin/media", icon: Images },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
  adminName: string;
  logoUrl?: string | null;
}

export default function Sidebar({ adminName, logoUrl }: SidebarProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Close "More" drawer on navigation
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Primary bottom bar items (First 4 items)
  const primaryNav = nav.slice(0, 4);
  // Secondary items for the "More" popover drawer
  const secondaryNav = nav.slice(4);

  const isTabActive = (href: string, label: string) => {
    const also = label === "Pages & Content" ? ["/admin/pages"] : [];
    return href === "/admin"
      ? pathname === href
      : [href, ...also].some((p) => pathname.startsWith(p));
  };

  const isMoreActive = secondaryNav.some(({ href, label }) =>
    isTabActive(href, label)
  );

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-slate-900 text-slate-300 md:flex">
        <div className="flex items-center gap-3 px-6 py-5">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Myyatra Circle"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600/20 text-sm font-bold text-teal-400">
              M
            </div>
          )}
          <span className="text-[10px] md:text-xs text-[#d8b978] font-sans font-medium tracking-[0.25em] uppercase block mt-1 text-center">MY YATRA CIRCLE</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 overflow-auto scrollbar-none ">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = isTabActive(href, label);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-teal-700 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>

        <form action={logout} className="border-t border-slate-800 p-3">
          <p className="px-3 pb-2 text-xs text-slate-500">
            Signed in as {adminName}
          </p>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-800 hover:text-white">
            <LogOut size={18} /> Log out
          </button>
        </form>
      </aside>

      {/* ================= MOBILE BOTTOM MELTING BAR ================= */}
      <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 md:hidden">
        {/* Liquid Container */}
        <div className="relative flex items-center justify-around rounded-3xl border border-white/20 bg-slate-900/90 p-1.5 shadow-2xl backdrop-blur-xl transition-all duration-300">
          
          {/* Main 4 Quick Nav Items */}
          {primaryNav.map(({ label, href, icon: Icon }) => {
            const active = isTabActive(href, label);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center px-3 py-2 transition-all duration-300 ${
                  active ? "text-teal-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {/* Active "Melted" Glow Aura around the icon */}
                {active && (
                  <span className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-teal-500/20 blur-md" />
                )}
                
                {/* Active Indicator Pillar */}
                {active && (
                  <span className="absolute -top-1.5 h-1.5 w-6 rounded-full bg-teal-400 shadow-[0_2px_8px_rgba(45,212,191,0.8)]" />
                )}

                <Icon
                  size={20}
                  className={`transition-transform duration-300 ${
                    active ? "-translate-y-0.5 scale-110" : ""
                  }`}
                />
                <span className="mt-1 text-[10px] font-medium tracking-tight">
                  {label}
                </span>
              </Link>
            );
          })}

          {/* "More" Trigger Button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`relative flex flex-col items-center justify-center px-3 py-2 transition-all duration-300 ${
              isMoreActive || isMoreOpen
                ? "text-teal-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {(isMoreActive || isMoreOpen) && (
              <span className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-teal-500/20 blur-md" />
            )}
            {(isMoreActive || isMoreOpen) && (
              <span className="absolute -top-1.5 h-1.5 w-6 rounded-full bg-teal-400 shadow-[0_2px_8px_rgba(45,212,191,0.8)]" />
            )}
            {isMoreOpen ? <X size={20} /> : <MoreHorizontal size={20} />}
            <span className="mt-1 text-[10px] font-medium tracking-tight">
              More
            </span>
          </button>
        </div>
      </div>

      {/* ================= MOBILE "MORE" OVERLAY DRAWER ================= */}
      {isMoreOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="fixed bottom-24 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 md:hidden">
            <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                All Navigation
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
              {secondaryNav.map(({ label, href, icon: Icon }) => {
                const active = isTabActive(href, label);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                      active
                        ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
                        : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>

            <form action={logout} className="mt-3 border-t border-slate-800 pt-3">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20">
                <LogOut size={16} /> Log out ({adminName})
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}