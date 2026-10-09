"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

// Transparent on top of the hero, solid navy with a thin gold line once you scroll.
export default function SiteHeader({ siteName, logo, items }: { siteName: string; logo: string; items: NavItem[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus after navigating, or when Escape is pressed
  useEffect(() => { setMobileOpen(false); setOpen(null); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobileOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const solid = scrolled || mobileOpen;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const hoverIn = (label: string) => { if (timer.current) clearTimeout(timer.current); setOpen(label); };
  const hoverOut = () => { timer.current = setTimeout(() => setOpen(null), 150); };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
      solid ? "border-gold/40 bg-navy shadow-lg" : "border-white/15 bg-gradient-to-b from-navy/70 to-transparent"}`}>
      <div className={`mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 transition-all duration-300 lg:px-14 ${solid ? "py-3" : "py-5"}`}>
        <Link href="/" className="shrink-0" aria-label={`${siteName} home`}>
          {logo ? (
            <Image src={logo} alt={siteName} width={220} height={80} priority className={`w-auto object-contain transition-all duration-300 ${solid ? "h-12" : "h-14"}`} />
          ) : (
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{siteName}</span>
          )}
        </Link>

        {/* desktop menu */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {items.map((item) => (
              <li key={item.label} className="relative"
                onMouseEnter={() => item.children && hoverIn(item.label)} onMouseLeave={() => item.children && hoverOut()}>
                <div className="flex items-center gap-1">
                  <Link href={item.href}
                    className={`border-b-2 py-2 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:text-gold-light ${
                      isActive(item.href) ? "border-gold" : "border-transparent"}`}>
                    {item.label}
                  </Link>
                  {item.children && (
                    <button type="button" aria-label={`${item.label} menu`} aria-expanded={open === item.label}
                      onClick={() => setOpen(open === item.label ? null : item.label)} className="p-1 text-white hover:text-gold-light">
                      <ChevronDown size={14} className={`transition-transform ${open === item.label ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                {item.children && open === item.label && (
                  <div className="absolute left-1/2 top-full z-10 -translate-x-1/2 pt-4">
                    <ul className="min-w-[250px] border border-line bg-white py-1 text-ink shadow-xl">
                      {item.children.map((c) => (
                        <li key={c.href + c.label} className="border-b border-line last:border-0">
                          <Link href={c.href} className="block px-5 py-3 text-[13px] transition-colors hover:bg-ivory hover:text-gold-dark">{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/customized-holidays"
            className="hidden items-center gap-2 border border-gold bg-gold px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-navy transition-colors hover:border-gold-dark hover:bg-gold-dark hover:text-white lg:inline-flex">
            Plan your journey <span aria-hidden>→</span>
          </Link>
          <button type="button" className="p-2 text-white lg:hidden" aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen} onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="max-h-[calc(100svh-72px)] overflow-y-auto border-t border-white/10 bg-navy px-6 pb-8 pt-4 lg:hidden">
          <ul className="divide-y divide-white/10">
            {items.map((item) => (
              <li key={item.label} className="py-1">
                {item.children ? (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white">
                      {item.label} <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="pb-3 pl-3">
                      {item.children.map((c) => (
                        <li key={c.href + c.label}>
                          <Link href={c.href} className="block py-2 text-sm text-white/70 hover:text-gold-light">{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link href={item.href} className="block py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white">{item.label}</Link>
                )}
              </li>
            ))}
          </ul>
          <Link href="/customized-holidays"
            className="mt-6 flex items-center justify-center gap-2 bg-gold px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-navy">
            Plan your journey <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </header>
  );
}
